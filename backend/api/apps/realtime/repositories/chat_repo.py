"""Repository for :class:`~apps.realtime.models.chat.Chat`."""
from __future__ import annotations

import uuid
from typing import Iterable, Optional

from django.db.models import Max, OuterRef, Prefetch, QuerySet, Subquery

from core.repositories import BaseRepository

from ..models.chat.chat import Chat
from ..models.chat.enums import ChatType
from ..models.chat.participants import ChatParticipant
from ..models.chat.message_request import MessageRequest


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
        """All chats where the user is a JOINED (active) participant, ordered
        by most recent activity first. Pending/declined requests do NOT
        appear here — they come from MessageRequestRepository."""
        return (
            self.get_queryset()
            .filter(
                participants__user_id=user_id,
                participants__status=ChatParticipant.Status.JOINED,
                participants__left_at__isnull=True,
            )
            .distinct()
            .order_by("-last_message_at", "-created_at")
        )

    def get_with_participants(self, chat_id: uuid.UUID) -> Optional[Chat]:
        return self.get_queryset().filter(id=chat_id).first()

    def find_direct_between(
        self, user_a_id: uuid.UUID, user_b_id: uuid.UUID
    ) -> Optional[Chat]:
        """Return an existing DM between two users where user_a is a JOINED
        participant and B is either a participant (any status) or the
        target of a pending MessageRequest linked to the chat."""
        from ..models.chat.message_request import MessageRequest
        # DMs where both A and B are participants already.
        exact = (
            self.get_queryset()
            .filter(
                type=ChatType.DIRECT,
                club__isnull=True,
                participants__user_id=user_a_id,
                participants__status=ChatParticipant.Status.JOINED,
            )
            .filter(participants__user_id=user_b_id)
            .first()
        )
        if exact is not None:
            return exact
        # DM where A is JOINED and there is a pending request to B.
        pending_req = (
            MessageRequest.objects
            .filter(
                from_user_id=user_a_id,
                to_user_id=user_b_id,
                status=MessageRequest.Status.PENDING,
                chat__isnull=False,
            )
            .select_related("chat")
            .first()
        )
        if pending_req is not None:
            return self.get_with_participants(pending_req.chat_id)
        return None

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
