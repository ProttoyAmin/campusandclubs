"""Repository for :class:`~apps.realtime.models.chat.MessageRequest`."""
from __future__ import annotations

import uuid
from typing import Optional

from django.db.models import QuerySet

from core.repositories import BaseRepository

from ..models.chat.message_request import MessageRequest


class MessageRequestRepository(BaseRepository[MessageRequest]):
    model = MessageRequest

    def get_queryset(self) -> QuerySet[MessageRequest]:
        return super().get_queryset().select_related("from_user", "to_user")

    def pending_for_recipient(self, user_id: uuid.UUID) -> QuerySet[MessageRequest]:
        return self.get_queryset().filter(
            to_user_id=user_id,
            status=MessageRequest.Status.PENDING,
        ).order_by("-created_at")

    def get_existing(
        self, from_user_id: uuid.UUID, to_user_id: uuid.UUID
    ) -> Optional[MessageRequest]:
        return self.get_pending(from_user_id, to_user_id)

    def get_pending(
        self, from_user_id: uuid.UUID, to_user_id: uuid.UUID
    ) -> Optional[MessageRequest]:
        return self.get_or_none(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            status=MessageRequest.Status.PENDING,
        )

    def create_request(
        self,
        *,
        from_user_id: uuid.UUID,
        to_user_id: uuid.UUID,
        content: str,
    ) -> MessageRequest:
        return self.create(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            content=content,
        )
