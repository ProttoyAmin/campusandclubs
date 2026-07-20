
on every endpoint change run:

services/api
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
- No requirement to query across types in one go (e.g. "institutes *and* events near me" isn't needed).
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