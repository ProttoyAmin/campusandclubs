"""Repository for :class:`~apps.realtime.models.chat.Chat`."""
from __future__ import annotations

import uuid
from typing import Optional

from django.db.models import Prefetch, QuerySet

from core.repositories import BaseRepository

from ..models.chat.chat import Chat
from ..models.chat.enums import ChatType
from ..models.chat.participants import ChatParticipant


class ChatRepository(BaseRepository[Chat]):
    model = Chat

    def get_queryset(self) -> QuerySet[Chat]:
        return (
            super()
            .get_queryset()
            .select_related("club")
            .prefetch_related(
                Prefetch(
                    "participants",
                    queryset=ChatParticipant.objects.select_related("user"),
                )
            )
        )

    def for_user(self, user_id: uuid.UUID) -> QuerySet[Chat]:
        """All chats where the user is an ACCEPTED participant — main inbox."""
        return (
            self.get_queryset()
            .filter(
                participants__user_id=user_id,
                participants__status=ChatParticipant.Status.ACCEPTED,
                participants__left_at__isnull=True,
            )
            .distinct()
            .order_by("-last_message_at", "-created_at")
        )

    def pending_for_user(self, user_id: uuid.UUID) -> QuerySet[Chat]:
        """DMs where the user is a PENDING participant — the message-requests
        inbox. Returns Chat objects (not requests) so the frontend can
        render the first message and the other participant."""
        return (
            self.get_queryset()
            .filter(
                type=ChatType.DIRECT,
                participants__user_id=user_id,
                participants__status=ChatParticipant.Status.PENDING,
            )
            .distinct()
            .order_by("-last_message_at", "-created_at")
        )

    def get_with_participants(self, chat_id: uuid.UUID) -> Optional[Chat]:
        return self.get_queryset().filter(id=chat_id).first()

    def find_direct_between(
        self, user_a_id: uuid.UUID, user_b_id: uuid.UUID
    ) -> Optional[Chat]:
        """Find an existing DM between two users where user A is a
        participant (any status) and B is also a participant. We DO NOT
        return chats where B has DECLINED — users can re-message after a
        decline by creating a new chat (or we flip the status back to
        PENDING on resend, handled in the service)."""
        return (
            self.get_queryset()
            .filter(
                type=ChatType.DIRECT,
                club__isnull=True,
                participants__user_id=user_a_id,
            )
            .filter(participants__user_id=user_b_id)
            .exclude(
                participants__status=ChatParticipant.Status.DECLINED,
                participants__user_id=user_b_id,
            )
            .first()
        )

    def list_club_chats(self, club_id: uuid.UUID) -> QuerySet[Chat]:
        return self.get_queryset().filter(club_id=club_id).order_by("-created_at")

    def create_chat(
        self,
        *,
        type: str,
        name: Optional[str] = None,
        club_id: Optional[uuid.UUID] = None,
        description: Optional[str] = None,
    ) -> Chat:
        return self.create(
            type=type,
            name=name,
            club_id=club_id,
            description=description,
        )

    def touch_last_message(self, chat: Chat, when) -> Chat:
        chat.last_message_at = when
        chat.save(update_fields=["last_message_at", "updated_at"])
        return chat
