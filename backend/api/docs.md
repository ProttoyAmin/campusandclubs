on every endpoint change run:

backend/api
python manage.py spectacular --file ../../packages/api/schema/openapi.yaml

from the root
pnpm --filter @campus/api generate

# Location Model — Future Plan

**Status:** Not implemented yet. Revisit when Institute/Event/User location and proximity search become a real requirement.

## Decision

Use a **shared `Location` model**, linked via `OneToOneField` from each owner (`Institute`, `Event`, `User`) — not `GenericForeignKey`.

**Why a shared model:** Institutes, Events, and Users all need a location, and proximity search ("near me") needs real lat/lng coordinates, not just free-text addresses. A single model avoids duplicating lat/lng/address fields and distance-query logic across three separate models.

**Why `OneToOneField`, not `GenericForeignKey`:**

- Each record needs exactly **one** location (confirmed: no multi-location cases like multi-venue events).
- No requirement to query across types in one go (e.g. "institutes _and_ events near me" isn't needed).
- GFK adds a `ContentType` join and `object_id` type-matching overhead for no real benefit here — and has already caused a real bug in this project (`Like`/`Comment`/`Share` `object_id` type mismatch with UUID pks). Avoid repeating that pattern unless cross-type queries are actually needed.

## Model shape

```python
import uuid
from django.db import models


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    latitude = models.FloatField()
    longitude = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
        ]
```

Usage on owning models:

```python
class Institute(models.Model):
    ...
    location = models.OneToOneField(
        "core.Location", on_delete=models.SET_NULL, null=True, blank=True, related_name="institute"
    )
```

Same pattern for `Event.location` and `User.location`.

**Important:** store `latitude`/`longitude` as real fields from day one, even before proximity search is built. Retrofitting coordinates onto existing free-text addresses later means geocoding every historical row — much more painful than adding the fields up front and leaving them unused until needed.

## Proximity search (when needed)

No PostGIS/GeoDTango required for this scale. Plain Haversine-distance annotation works on SQLite and Postgres alike:

```python
# core/repositories/location.py
from django.db.models import F, FloatField, QuerySet
from django.db.models.functions import ACos, Cos, Radians, Sin


def annotate_distance(queryset: QuerySet, lat: float, lng: float, location_field: str = "location") -> QuerySet:
    return queryset.annotate(
        distance=6371 * ACos(
            Cos(Radians(lat)) * Cos(Radians(F(f"{location_field}__latitude")))
            * Cos(Radians(F(f"{location_field}__longitude")) - Radians(lng))
            + Sin(Radians(lat)) * Sin(Radians(F(f"{location_field}__latitude"))),
            output_field=FloatField(),
        )
    )
```

Usage in a repository:

```python
class InstituteRepository(BaseRepository[Institute]):
    model = Institute

    def near(self, lat: float, lng: float, radius_km: float = 10) -> QuerySet[Institute]:
        return annotate_distance(self.get_queryset(), lat, lng).filter(distance__lte=radius_km).order_by("distance")
```

Result is distance in kilometers. Since `annotate_distance` is a standalone function (not tied to `BaseRepository`), any repository needing it (`EventRepository`, `UserRepository`) can import and reuse it directly.

## When to revisit PostGIS

Move to PostGIS + `PointField` only when:

- Real scale is hit (thousands of rows with frequent radius queries), and/or
- Migrating to Postgres anyway.

PostGIS gives spatial indexes that make radius queries dramatically faster than per-row Haversine computation. The `Location` model's shape (plain float lat/lng) transfers cleanly to `PointField` later — this isn't a dead end, just a deliberately deferred upgrade.

<!-- Request Info -->

<!-- request.__dict__ -->

{'\_auth': None,
'\_authenticator': <rest_framework.authentication.SessionAuthentication object at 0x000002401D147380>,
'\_content_type': <class 'rest_framework.request.Empty'>,
'\_data': <class 'rest_framework.request.Empty'>,
'\_files': <class 'rest_framework.request.Empty'>,
'\_full_data': <class 'rest_framework.request.Empty'>,
'\_request': <ASGIRequest: GET '/api/v1/accounts/auth/request-info/'>,
'\_stream': <class 'rest_framework.request.Empty'>,
'\_user': <SimpleLazyObject: <User: prottoy - 0aa9ce92-d3c1-4f62-9e5e-e2076ceaf39e>>,
'accepted_media_type': 'text/html',
'accepted_renderer': <rest_framework.renderers.BrowsableAPIRenderer object at 0x000002401D1478C0>,
'authenticators': [<rest_framework_simplejwt.authentication.JWTAuthentication object at 0x000002401D147230>,
<rest_framework.authentication.SessionAuthentication object at 0x000002401D147380>],
'csrf_processing_done': True,
'negotiator': <rest_framework.negotiation.DefaultContentNegotiation object at 0x000002401D1474D0>,
'parser_context': {'args': (),
'encoding': 'utf-8',
'kwargs': {},
'request': <rest_framework.request.Request: GET '/api/v1/accounts/auth/request-info/'>,
'view': <apps.accounts.view.auth.request_info.WrappedAPIView object at 0x000002401D146CF0>},
'parsers': [<rest_framework.parsers.JSONParser object at 0x000002401D146E40>,
<rest_framework.parsers.FormParser object at 0x000002401D146F90>,
<rest_framework.parsers.MultiPartParser object at 0x000002401D1470E0>],
'version': None,
'versioning_scheme': None}

<!-- request._request.META -->

{'CSRF_COOKIE': 'LXHbf5FqInQDHvjvEspG28A5wnbHKf1J',
'HTTP_ACCEPT': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,_/_;q=0.8,application/signed-exchange;v=b3;q=0.7',
'HTTP_ACCEPT_ENCODING': 'gzip, deflate, br, zstd',
'HTTP_ACCEPT_LANGUAGE': 'en-US,en;q=0.9,ru;q=0.8,bn;q=0.7',
'HTTP_CACHE_CONTROL': 'no-cache',
'HTTP_CONNECTION': 'keep-alive',
'HTTP_COOKIE': 'tabstyle=html-tab; '
'csrftoken=LXHbf5FqInQDHvjvEspG28A5wnbHKf1J; '
'sessionid=j2a4sbuxq683t488x4k2nqug4u4tywp5; '
'refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4NjkxNjcyMSwiaWF0IjoxNzg0MzI0NzIxLCJqdGkiOiI3OWM1Y2Q1OWQxMDE0MzE1OTU4ZTk2MmY5NTA2MjU2MCIsInVzZXJfaWQiOiIwYWE5Y2U5Mi1kM2MxLTRmNjItOWU1ZS1lMjA3NmNlYWYzOWUifQ.jwiG8REGYtmox4HBP8jAXX8ti6KLUan6oGucFc-1anc',
'HTTP_HOST': '127.0.0.1:8000',
'HTTP_PRAGMA': 'no-cache',
'HTTP_SEC_CH_UA': '"Not;A=Brand";v="8", "Chromium";v="150", "Google '
'Chrome";v="150"',
'HTTP_SEC_CH_UA_MOBILE': '?0',
'HTTP_SEC_CH_UA_PLATFORM': '"Windows"',
'HTTP_SEC_FETCH_DEST': 'document',
'HTTP_SEC_FETCH_MODE': 'navigate',
'HTTP_SEC_FETCH_SITE': 'none',
'HTTP_SEC_FETCH_USER': '?1',
'HTTP_UPGRADE_INSECURE_REQUESTS': '1',
'HTTP_USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 '
'Safari/537.36',
'PATH_INFO': '/api/v1/accounts/auth/request-info/',
'QUERY_STRING': '',
'REMOTE_ADDR': '127.0.0.1',
'REMOTE_HOST': '127.0.0.1',
'REMOTE_PORT': 52352,
'REQUEST_METHOD': 'GET',
'SCRIPT_NAME': '',
'SERVER_NAME': '127.0.0.1',
'SERVER_PORT': '8000',
'wsgi.multiprocess': True,
'wsgi.multithread': True}
x

<!-- session -->

([('_auth_user_id', '0aa9ce92-d3c1-4f62-9e5e-e2076ceaf39e'), ('_auth_user_backend', 'django.contrib.auth.backends.ModelBackend'), ('_auth_user_hash', '54c38175e94a778aa09dee7bf13bf4f904f1996553a80cab1037f19d6bb9fcc6')])

# API Documentation:

# OpenAPI & AI-Friendly API Design Guidelines

Design APIs around REST resources with consistent naming (e.g., `/clubs/{club_uuid}/applications/`), using standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) instead of action-based URLs. Give models, serializers, views, and endpoints descriptive names (`ClubCreateSerializer`, `ClubDetailSerializer`, etc.) and write clear docstrings for views explaining the endpoint's purpose, requirements, and possible responses. Add `help_text` to model and serializer fields so descriptions appear in the generated OpenAPI schema, and use enums (`TextChoices`) for constrained values. Define separate serializers for requests and responses, document all response codes, authentication requirements, path/query parameters, and include operation summaries and unique operation IDs. Keep naming consistent across URLs, serializers, models, and JSON fields (e.g., always use `club_uuid` instead of mixing `id`, `pk`, and `uuid`). Return a consistent response envelope throughout the API, model relationships explicitly instead of flattening related data, and generate/update the OpenAPI schema continuously using tools like `drf-spectacular` with `@extend_schema`. A clean, descriptive, and consistent OpenAPI specification significantly improves AI code generation, SDK generation, documentation quality, and frontend integration.
