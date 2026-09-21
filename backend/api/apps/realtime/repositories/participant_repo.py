"""Repository for :class:`~apps.realtime.models.chat.ChatParticipant`."""
from __future__ import annotations

import uuid
from typing import Iterable, Optional

from django.db.models import QuerySet
from django.utils import timezone

from core.repositories import BaseRepository

from ..models.chat.participants import ChatParticipant


class ChatParticipantRepository(BaseRepository[ChatParticipant]):
    model = ChatParticipant

    def get_queryset(self) -> QuerySet[ChatParticipant]:
        return super().get_queryset().select_related("user", "chat")

    def for_chat(self, chat_id: uuid.UUID) -> QuerySet[ChatParticipant]:
        return self.get_queryset().filter(chat_id=chat_id)

    def accepted_for_chat(self, chat_id: uuid.UUID) -> QuerySet[ChatParticipant]:
        return self.for_chat(chat_id).filter(
            status=ChatParticipant.Status.ACCEPTED,
            left_at__isnull=True,
        )

    def pending_for_chat(self, chat_id: uuid.UUID) -> QuerySet[ChatParticipant]:
        return self.for_chat(chat_id).filter(status=ChatParticipant.Status.PENDING)

    def get(self, chat_id: uuid.UUID, user_id: uuid.UUID) -> Optional[ChatParticipant]:
        return self.get_or_none(chat_id=chat_id, user_id=user_id)

    def is_accepted_member(self, chat_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        return self.get_queryset().filter(
            chat_id=chat_id,
            user_id=user_id,
            status=ChatParticipant.Status.ACCEPTED,
            left_at__isnull=True,
        ).exists()

    def add(
        self,
        *,
        chat_id: uuid.UUID,
        user_id: uuid.UUID,
        status: str = ChatParticipant.Status.ACCEPTED,
        is_admin: bool = False,
        is_owner: bool = False,
    ) -> ChatParticipant:
        obj, _ = self.model.objects.update_or_create(
            chat_id=chat_id,
            user_id=user_id,
            defaults={
                "status": status,
                "is_admin": is_admin,
                "is_owner": is_owner,
                "left_at": None,
            },
        )
        return obj

    def update_status(
        self, participant: ChatParticipant, *, status: str
    ) -> ChatParticipant:
        participant.status = status
        if status == ChatParticipant.Status.DECLINED:
            participant.left_at = timezone.now()
        else:
            participant.left_at = None
        participant.save(update_fields=["status", "left_at", "updated_at"])
        return participant

    def mark_read(self, participant: ChatParticipant, when) -> ChatParticipant:
        participant.last_read_at = when
        participant.save(update_fields=["last_read_at", "updated_at"])
        return participant

    def bulk_add(
        self,
        chat_id: uuid.UUID,
        user_ids: Iterable[uuid.UUID],
        *,
        status: str = ChatParticipant.Status.ACCEPTED,
        is_admin: bool = False,
    ) -> list[ChatParticipant]:
        objs = [
            ChatParticipant(
                chat_id=chat_id,
                user_id=uid,
                status=status,
                is_admin=is_admin,
            )
            for uid in user_ids
        ]
        return self.model.objects.bulk_create(objs, ignore_conflicts=True)
