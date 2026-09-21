"""Repository for :class:`~apps.media.models.Media`.

Provides typed helpers for attaching uploaded Cloudinary media to any
model (Posts, Clubs, Users, ...), and is used by the realtime chat
service to persist attachments on messages.
"""
from __future__ import annotations

from typing import Iterable, Optional

from django.contrib.contenttypes.models import ContentType
from django.db.models import Max, QuerySet

from core.repositories import BaseRepository

from ..models import Media, MediaRole


class MediaRepository(BaseRepository[Media]):
    model = Media

    # ------------------------------------------------------------------ #
    # Queries
    # ------------------------------------------------------------------ #
    def get_queryset(self) -> QuerySet[Media]:
        return super().get_queryset().filter(removed_at__isnull=True)

    def for_object(
        self,
        *,
        obj,
        role: Optional[str] = None,
    ) -> QuerySet[Media]:
        """Return media rows attached to ``obj`` (any model instance),
        optionally filtered by role."""
        ct = ContentType.objects.get_for_model(obj._meta.model)
        qs = self.get_queryset().filter(content_type=ct, object_id=obj.pk)
        if role is not None:
            qs = qs.filter(role=role)
        return qs.order_by("position")

    # ------------------------------------------------------------------ #
    # Mutations
    # ------------------------------------------------------------------ #
    def attach_files(
        self,
        *,
        obj,
        files: Iterable,
        role: str = MediaRole.ATTACHMENT,
        original_file_names: Optional[dict[int, str]] = None,
    ) -> list[Media]:
        """Persist one or more uploaded files against ``obj``.

        ``files`` is an iterable of Django ``UploadedFile`` objects (as
        DRF's ``serializer.validated_data["file"]`` produces). We append
        them in order and auto-compute the next ``position`` for the
        (content_type, object_id, role) bucket.
        """
        if not files:
            return []
        ct = ContentType.objects.get_for_model(obj._meta.model)
        last_position = (
            self.model.objects
            .filter(content_type=ct, object_id=obj.pk, role=role)
            .aggregate(Max("position"))["position__max"]
        )
        next_pos = 0 if last_position is None else last_position + 1
        created: list[Media] = []
        for idx, f in enumerate(files):
            name = None
            if original_file_names and idx in original_file_names:
                name = original_file_names[idx]
            elif hasattr(f, "name"):
                name = f.name
            media = self.model.objects.create(
                content_type=ct,
                object_id=obj.pk,
                file=f,
                role=role,
                original_file_name=name or "",
                position=next_pos + idx,
            )
            created.append(media)
        return created

    def soft_remove(self, media: Media) -> None:
        from django.utils import timezone
        media.removed_at = timezone.now()
        media.save(update_fields=["removed_at"])
