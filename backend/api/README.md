# Campus & Clubs — Backend API

Django REST backend for the **Campus & Clubs** platform: a social + club-management
product that ties students, institutes, clubs, posts, and notifications together.

This is the `api` Django project. It is served by **ASGI** (HTTP + WebSocket),
talks to a single SQLite database in development, and is designed to slot into
a monorepo that also hosts a TypeScript frontend and a generated TS SDK
consumed via the OpenAPI schema emitted from this project.

---

## Stack

| Concern        | Choice                                                                    |
| -------------- | ------------------------------------------------------------------------- |
| Framework      | Django 5.2 / 6.0 + Django REST Framework                                  |
| Runtime        | `daphne` over `core.asgi` (HTTP + WebSocket)                              |
| WebSockets     | Django Channels + `channels-redis` (Redis channel layer)                  |
| Auth           | Custom `accounts.User` + `djoser` + `djangorestframework-simplejwt` (HS256, 60 min access / 30 day rotating refresh) + `django-allauth[headless]` (Google provider) |
| Session/JWT    | Cookie-based JWT via `apps.accounts.config.authentication.CookieJWTAuthentication`, with `SessionAuthentication` as a fallback |
| Database       | SQLite (`db.sqlite3`) in dev — swap `DATABASES` for Postgres in prod      |
| Media          | Cloudinary (`cloudinary`, `boto3`, `pillow`) — local `MEDIA_ROOT` in dev  |
| Email          | `django-anymail` with the **Resend** backend                              |
| Realtime infra | Redis (`redis>=8`); capacity 1500, 10s expiry on the channel layer        |
| API schema     | `drf-spectacular` + Swagger UI; spec is the source of truth for the TS SDK |
| Tooling        | `uv` (`uv.lock`, `pyproject.toml`), `ruff`, `django-stubs`, `django-debug-toolbar` |

Python ≥ 3.13 (see `pyproject.toml`).

---

## Project layout

```
api/
├── manage.py
├── pyproject.toml            # source of truth for deps (uv)
├── uv.lock
├── requirements.txt          # legacy UTF-16 pin list — prefer pyproject.toml
├── .env.local                # local secrets (DJANGO reads this on startup)
├── db.sqlite3                # dev database (committed for now)
├── accounts.http             # manual HTTP request scratchpad
├── clubs.http                # manual HTTP request scratchpad
│
├── core/                     # project-level cross-cutting code
│   ├── settings.py
│   ├── asgi.py               # HTTP + Channels router
│   ├── wsgi.py
│   ├── urls.py               # /api/* URL mounts + admin + schema/docs
│   ├── constants.py
│   ├── context.py
│   ├── generate.py
│   ├── pagination.py
│   ├── repositories/base.py  # BaseRepository[T]
│   ├── services/base.py      # BaseService[T, RepoT]
│   ├── policies/base.py      # Policy[Actor, Record]
│   ├── views/
│   │   ├── base.py           # PolicyMixin / ServiceMixin / BaseAPIView
│   │   └── private.py        # PrivateResponseMixin
│   ├── schema/api_response.py    # OpenAPI {success, message, data} envelope helper
│   ├── response/api_response.py  # Runtime ApiResponse / ApiError envelope
│   ├── openapi/hook.py           # Spectacular hooks (merge allauth spec, prefix filters)
│   ├── services/                 # cross-app services (base only right now)
│   └── settings/                 # reserved for split settings modules
│
└── apps/
    ├── accounts/             # users, JWT, allauth, social login, WS activity
    ├── institutes/           # colleges/universities
    ├── clubs/                # clubs, roles, memberships, events, invites, forms
    ├── interactions/         # likes / comments / shares (mounted at /api/activities/)
    ├── posts/                # feed + post media
    ├── connections/          # follow / block graph
    ├── notifications/        # in-app notifications + WS notifications
    ├── communications/       # outbound email API (newest app)
    └── media/                # media upload orchestration
```

Each app follows the same layered shape, with the per-app subpackages listed
under it:

```
apps/<name>/
├── models/         # Django models (often split per aggregate)
├── repositories/   # query-side abstraction over the ORM
├── services/       # use-cases; orchestrates repositories; holds the actor
├── policies/       # authorization rules (actor + record)
├── serializer/     # request/response serializers
├── view/ or viewss/# DRF views (split per resource for large apps)
├── schema/         # per-app OpenAPI helpers
├── dtos/           # small typed request/response DTOs
├── consumers.py    # Channels consumer(s), if any
├── routing.py      # WS route registration, if any
├── signals.py      # in-process signals, if any
├── tasks.py        # Celery-shaped tasks, if any
├── management/     # custom manage.py commands
├── migrations/
├── admin.py
├── apps.py
├── tests.py
└── urls.py
```

A few apps still keep a flat `models.py` / `serializers.py` / `views.py` and
migrate into packages as they grow — both styles are tolerated.

---

## Layered architecture

Every endpoint flows through the same stack:

```
HTTP / WS request
        ↓
   view (BaseAPIView + PolicyMixin + ServiceMixin)
        ↓
   service (BaseService) ──── holds the actor (current user) and a repository
        ↓                          ↓
   policy (Policy)         repository (BaseRepository)
        ↓                          ↓
   authorization           ORM (Django models)
```

* **`core.repositories.base.BaseRepository[T]`** — thin wrapper around the
  default manager: `get_queryset`, `all`, `only`, `filter`, `get`, `get_or_none`,
  `exists`, `create`, `update`, `delete`. Override `get_queryset` to scope
  queries (e.g. exclude soft-deleted rows).
* **`core.services.base.BaseService[T, RepoT]`** — `__init__(actor, repository?)`
  where `repository_class` resolves the default repository. Side-effects (Redis
  writes, channel-layer broadcasts, etc.) belong here.
* **`core.policies.base.Policy[ActorT, RecordT]`** — keeps authorization out of
  models, serializers, and views. Pass the actor + the target record; raise on
  deny.
* **`core.views.base.BaseAPIView`** — `generics.GenericAPIView` that wires a
  `policy_class` and a `service_class`. `PolicyMixin` and `ServiceMixin` are
  available for finer-grained mixes.

### Response envelope

Every successful endpoint should return the standard envelope, enforced by
`core.response.ApiResponse` / `ApiError`:

```json
{ "success": true,  "message": "OK", "data": { ... } }
{ "success": false, "message": "...", "data": { "errors": { ... } } }
```

The matching OpenAPI shape is produced by `core.schema.api_response.api_response(inner, name=..., many=...)`.
`name` must be globally unique — it becomes the OpenAPI component name and the
generated TS type name.

### Private resource pattern

For endpoints that return a different shape to the owner vs. everyone else,
use `core.views.private.PrivateResponseMixin` and set `private_serializer_class`
+ `private_detail_message`. The mixin returns
`{ "detail": "<reason>", ...private_payload }` to the actor.

---

## Apps at a glance

* **`accounts`** — Custom `User` model (`AUTH_USER_MODEL = "accounts.User"`).
  Djoser registration, activation, password reset. SimpleJWT access + rotating
  refresh tokens, with blacklist on rotation. JWT also delivered as an HTTP-only
  cookie via `CookieJWTAuthentication`. Google social login through allauth
  headless (`HEADLESS_ONLY=True`). WS endpoint at `ws/activity/` plus an
  `ActivityTracker` service that uses Redis for last-seen and connection counts.
* **`institutes`** — Colleges / universities users belong to.
* **`clubs`** — Largest app. Aggregates `club/`, `membership/`, `role/`, `event/`,
  `invite/`, `form/`. RBAC is maturing (role-based memberships, owner leave
  handling). Views are split into top-level `views.py` and resource-specific
  `views_clubs_post_views.py`, `views_event_views.py`, `views_members_views.py`,
  with the newer `viewss/{club,membership}` package carrying the refactor.
* **`interactions`** — Likes, comments, shares on posts. Mounted at
  `/api/activities/`.
* **`posts`** — User feed + post media. `FEED_ALGORITHM.md` describes the feed
  rules: only accepted follows, public-profile public posts, exclude blocks
  (both directions), exclude private/deleted posts.
* **`connections`** — Follow / block graph between users.
* **`notifications`** — Persistent notifications, REST endpoints + WS consumer
  at `ws/notifications/`. Has its own `signals.py` for in-process fan-out.
* **`communications`** — Newest app; first endpoint is a successful email-send
  API view. Mostly scaffolding, but already wired into `/api/communications/`.
* **`media`** — Thin wrapper around media uploads.

---

## URL surface

Mounted in `core/urls.py`:

| Prefix                  | App             |
| ----------------------- | --------------- |
| `/admin/`               | Django admin    |
| `/__debug__/`           | `debug_toolbar` (dev only) |
| `/api/accounts/`        | `apps.accounts` |
| `/api/institutes/`      | `apps.institutes` |
| `/api/clubs/`           | `apps.clubs`    |
| `/api/activities/`      | `apps.interactions` |
| `/api/posts/`           | `apps.posts`    |
| `/api/connections/`     | `apps.connections` |
| `/api/notifications/`   | `apps.notifications` |
| `/api/communications/`  | `apps.communications` |
| `/api/media/`           | `apps.media`    |
| `/api/_allauth/`, `/accounts/` | `allauth` headless + browser |
| `/api/schema/`, `/api/docs/`   | `drf-spectacular` raw + Swagger UI |

`SPECTACULAR_SETTINGS.SCHEMA_PATH_PREFIX = r"/api/v1"` — the schema is
versioned at `v1`.

---

## Auth flow

* **Default DRF authentication** — `CookieJWTAuthentication` (cookie JWT) +
  `SessionAuthentication`.
* **Djoser** — registration with retype password, activation email, password
  reset/change confirmations, username reset, all wired in `DJOSER.SERIALIZERS`.
* **JWT** — 60 min access / 30 day refresh; refresh tokens rotate and are
  blacklisted after rotation. Custom serializer
  `apps.accounts.serialize.auth.token.RefreshTokenSerializer`.
* **Social** — `allauth` headless with Google. `HEADLESS_FRONTEND_URLS` maps
  flows like password reset to `http://localhost:4000/@/auth/reset-password/{key}`.
* **Email delivery** — `anymail.backends.resend.EmailBackend`. Activation uses
  a custom `apps.accounts.emails.CustomActivationEmail`.

---

## Realtime (Channels)

* `core.asgi.application` mounts `AllowedHostsOriginValidator(AuthMiddlewareStack(URLRouter(...)))`.
* Combined WS patterns come from `apps.notifications.routing` and
  `apps.accounts.routing`:
  * `ws/activity/` — `UserActivityConsumer` (presence / online-offline).
  * `ws/notifications/` — `NotificationConsumer`.
* Channel layer: Redis (`channels_redis.core.RedisChannelLayer`); host from
  `REDIS_HOST` / `REDIS_PORT` env vars (defaults `127.0.0.1:6379`).
* Activity tracking tunables: `ACTIVITY_TIMEOUT=300s`, `HEARTBEAT_INTERVAL=60s`.

---

## OpenAPI / SDK pipeline

1. Endpoints are annotated with `drf-spectacular` (`@extend_schema`,
   `help_text`, `TextChoices`, request vs response serializers).
2. `SPECTACULAR_SETTINGS.POSTPROCESSING_HOOKS` merges `allauth`'s static spec
   into ours so the headless auth endpoints show up in Swagger.
3. Per-prefix hook factories (`accounts_only`, `clubs_only`, `posts_only`)
   exist in `core/openapi/hook.py` if you want to scope what gets exported.
4. Regenerate the spec to the workspace SDK package with:

   ```bash
   # from backend/api/
   python manage.py spectacular --file ../../packages/api/schema/openapi.yaml

   # from the repo root
   pnpm --filter @campus/api generate
   ```

---

## Design conventions

Followed across the codebase (see `docs.md` for the full guide):

* **REST resources, not action URLs** — `/clubs/{club_uuid}/applications/`, not
  `/clubs/apply/`.
* **HTTP semantics** — `GET` / `POST` / `PATCH` / `DELETE` on the resource.
* **Descriptive naming** — `ClubCreateSerializer` vs `ClubDetailSerializer`;
  same for models, views, endpoints.
* **`help_text` everywhere** — it surfaces in the OpenAPI schema.
* **Enums** — use `TextChoices` for constrained values.
* **Request and response serializers are separate**.
* **Document all response codes, auth requirements, path/query params**, and
  give every operation a unique `operation_id` and a summary.
* **Stable identifiers** — always `club_uuid`, never mix `id` / `pk` / `uuid`.
* **Consistent envelope** — `{success, message, data}` everywhere (see above).
* **Nest relationships, don't flatten them.**
* **No `GenericForeignKey` by default.** A shared `Location` model linked via
  `OneToOneField` is the agreed pattern for geo data (see `docs.md`). GFK has
  already bitten us on `Like`/`Comment`/`Share` `object_id` vs UUID primary
  keys.
* **OpenAPI is regenerated continuously** — keep it in sync, don't drift.

---

## Local development

```bash
# 1. Install deps (uv is the source of truth)
uv sync

# 2. Configure secrets
cp .env.local.example .env.local   # if an example exists; otherwise create .env.local
# required: RESEND_API_KEY, GOOGLE_CLIENT_ID/SECRET, REDIS_HOST/PORT, CLOUDINARY_*, etc.

# 3. Migrate + run
uv run python manage.py migrate
uv run python manage.py runserver       # HTTP only
uv run daphne -b 0.0.0.0 -p 8000 core.asgi:application   # HTTP + WS
```

### Useful env vars (see `core/settings.py` for the full list)

* `DEBUG` — `True` / `False` (default `False`).
* `ALLOWED_HOSTS` — defaults to `["*"]` in dev; tighten for prod.
* `CORS_ALLOWED_ORIGINS` — pre-populated for `localhost:4000` (Next),
  `localhost:5173` (Vite), `127.0.0.1:3000`.
* `CSRF_TRUSTED_ORIGINS` — pre-populated for ngrok + dev ports.
* `DOMAIN` (default `127.0.0.1`), `SITE_NAME`.
* `RESEND_API_KEY`, `EMAIL_HOST_USER`, `EMAIL_APP_PASSWORD` — email.
* `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google social login.
* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` — media.
* `REDIS_HOST`, `REDIS_PORT` — channel layer + activity tracker.
* `ACTIVITY_TIMEOUT` (default `300`), `HEARTBEAT_INTERVAL` (default `60`).

### Database

SQLite is committed for now (`db.sqlite3`). To switch to Postgres, change
`DATABASES['default']` and re-run `migrate`. Models default to
`BigAutoField`, except the custom `User` which uses a UUID primary key.

### Manual HTTP testing

`accounts.http` and `clubs.http` at the project root are scratchpads for
calling endpoints from your editor / REST client.

---

## Notable in-repo docs

* `docs.md` — OpenAPI design guide + the `Location` model decision.
* `FEED_ALGORITHM.md` — rules behind the personalized feed in `apps/posts`.
* `WEBSOCKET_IMPLEMENTATION_PLAN.md` — original plan for Channels + the
  activity tracker; the implemented version lives in `apps/accounts` and
  `apps/notifications`.

---

## Status

* **Current focus:** clubs RBAC (roles, owner leave, permissions).
* **In progress:** `communications` app (email send API is live).
* **Next:** tightening clubs permissions across the views/services/policies
  split; broader rollout of the layered `view/` / `viewss/` packages.
