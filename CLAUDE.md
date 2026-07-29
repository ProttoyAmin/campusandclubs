# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm-workspace monorepo. The working tree mixes a **live** backend at `backend/api` with a **parallel rewrite** at `backend/api-v2` (currently a `api-v2.md` design doc — do not run commands against it; the active API is `backend/api`).

```
backend/
  api/         # Django + DRF (active)
  api-v2/      # future rewrite (doc-only at the moment)
clients/
  web/         # React 19 + Vite + TS
packages/
  api/         # Generated TS SDK from the backend OpenAPI schema
```

The frontend depends on `packages/api` via `workspace:*` (see `clients/web/package.json`). The web app's `web.architecture.md` shows the intended `src/` layout (`app/`, `features/`, `components/`, `lib/`, `routes/`, `providers/`) — only `App.tsx`, `main.tsx`, `index.css`, `App.css`, and `assets/` are populated today; the rest is scaffold to follow.

## Commands

The repo's task runner is `rav` (config: `rav.yaml`). The `rav run` targets below are thin wrappers over the underlying pnpm / `uv run` invocations — run those directly when `rav` is not installed.

### Web (from repo root)

- `pnpm --filter web dev` — Vite dev server (HMR). Mirrors `rav run web`.
- `pnpm --filter web build` — type-check (`tsc -b`) then `vite build`.
- `pnpm --filter web lint` — `eslint .` (config: `clients/web/eslint.config.js`).
- `pnpm --filter web preview` — serve the built bundle.
- `pnpm -r build` — build every workspace package (used by `rav run build`).

There is no test runner configured for the web app.

### Backend (from `backend/api`)

`uv` is the package manager. The venv lives at `backend/api/.venv/` and is already created.

- `uv run python manage.py runserver` — Django dev server on `:8000` (mirrors `rav run server`).
- `uv run python manage.py makemigrations` — generate migrations per app.
- `uv run python manage.py migrate` — apply migrations.
- `uv run python manage.py spectacular --file ../../packages/api/schema/openapi.yaml` — regenerate the OpenAPI schema (the input to the TS SDK generator).
- `ruff` is in the dev dependency group but is not wired into any script — run it manually.
- The default DB is `backend/api/db.sqlite3`; settings support `DEBUG`, `DOMAIN`, `SITE_NAME`, `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, `ACTIVITY_TIMEOUT`, `HEARTBEAT_INTERVAL` via env. Settings already load `backend/api/.env.local` if present; `.env` is checked in for local overrides.

### Regenerating the TypeScript SDK (frontend ↔ backend contract)

Run **after** changing any DRF view/serializer that should appear in the client:

```bash
# from backend/api
uv run python manage.py spectacular --file ../../packages/api/schema/openapi.yaml
# from repo root
pnpm --filter @campus/api generate
```

The generator is `@hey-api/openapi-ts` (`packages/api/openapi-ts.config.ts`); output lands in `packages/api/generated/` and is consumed by the web app as `@campus/api`. Do not hand-edit files under `packages/api/generated/`.

## Architecture

### Backend (`backend/api`)

- `core/` holds the Django project (settings, root URLconf, ASGI/WSGI entry points, helpers).
  - `core/settings.py` wires DRF, `djoser`, `simple-jwt` (60-min access, 30-day refresh, rotation + blacklist), `drf-spectacular`, `corsheaders`, `channels`, and the Channels Redis layer. `AUTH_USER_MODEL = "accounts.User"`.
  - `core/urls.py` mounts versioned API under `/api/v1/<app>/`, plus `/api/schema/` (raw OpenAPI) and `/api/docs/` (Swagger UI).
  - `core/asgi.py` combines HTTP (Django) and WebSocket routers from `apps.accounts.routing` and `apps.notifications.routing` behind `AuthMiddlewareStack` + `AllowedHostsOriginValidator`.
- `apps/` are domain-specific Django apps. Each follows the same shape: `models.py`, `serializers.py`, `views.py` (or split viewsets for `clubs`), `urls.py`, `admin.py`, `tests.py`, plus a `migrations/` folder. WebSocket-aware apps (`accounts`, `notifications`) also have `routing.py` and `consumers.py`.
  - `accounts/` — custom `User`, registration serializer, JWT/djoser wiring, activity tracking, `services/` subpackage, `emails.py` for activation/reset templates, a `management/` subpackage, and WebSocket consumers.
  - `clubs/` — split into `views_clubs_post_views.py`, `views_event_views.py`, `views_members_views.py` plus a shared `views.py`; has its own `permissions.py`.
  - `posts/` — Celery tasks in `tasks.py` (Celery is installed but the broker is not configured in `settings.py`; assume Redis/celery wiring is a TODO).
  - `interactions/` — likes/reactions; `connections/` — follow graph; `notifications/` — WebSocket-pushed notifications with `signals.py`; `institutes/` — institute metadata.
- The intended cross-cutting concerns (`core/middleware`, `core/permissions`, `core/pagination`, `core/exceptions`, `core/responses`, `core/authentication`, `core/utils`, `core/openapi`) are listed in `backend/architecture.md` but only `pagination.py` and `generate.py` are present — these are the next places to add shared infrastructure.
- Local request examples for several endpoints live in `backend/api/accounts.http` and `backend/api/clubs.http` (and the repo-root `api.http` for the `accounts` auth surface); use them as living docs of the JWT flow and request shapes.

### Frontend (`clients/web`)

- React 19 + Vite 8 + TypeScript 6, Tailwind v4 (wired via `@tailwindcss/vite` but the `vite.config.ts` does not yet register it).
- `src/main.tsx` mounts `<App />` inside `<StrictMode>`. The current `App.tsx` is the unmodified Vite starter template — replace it as features land; the `src/` tree should follow `web.architecture.md` (app shell, features-by-domain, layouts, lib/axios, providers, routes).
- The `@campus/api` workspace package is the single source of truth for backend types and SDK calls; do not add ad-hoc fetch wrappers or re-declare API types.

### WebSocket surface

Active consumers:

- `apps/accounts/routing.py` — account-scoped channels.
- `apps/notifications/routing.py` — mounted at `ws/notifications/`.

Both flow through the combined `all_websocket_urlpatterns` in `core/asgi.py`; add new WebSocket endpoints by registering a `routing.py` in the owning app and including it in `core/asgi.py`.

## Conventions / non-obvious notes

- The README refers to `services/api`; in the tree the Django project is at `backend/api`. Use `backend/api` paths in commands and PRs.
- `core/generate.py` is currently a commented-out Snowflake-ID generator stub, not a real codegen step — the active schema generator is `manage.py spectacular`.
- `backend/api-v2/` exists alongside the active API; treat it as out-of-scope unless the user explicitly asks about the v2 rewrite.
- `packages/api/generated/` is build output from the OpenAPI schema; do not commit hand edits.
- `djoser` is configured with custom serializers (`apps.accounts.serializers.*`) and a custom activation email class (`apps.accounts.emails.CustomActivationEmail`); follow the same pattern when adding djoser flows.
- `.vscode/settings.json` is purely cosmetic (custom title bar / status bar colors); no editor-enforced rules.
