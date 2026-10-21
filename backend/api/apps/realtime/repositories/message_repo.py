"""Repository for :class:`~apps.realtime.models.chat.Message` and related
receipt/attachment rows."""
from __future__ import annotations

import uuid
from typing import Iterable, Optional, Sequence

from django.db.models import Exists, OuterRef, Prefetch, Q, QuerySet
from django.utils import timezone

from core.repositories import BaseRepository

from ..models.chat.message import (
    Message,
    MessageDeleteMode,
    MessageStatus,
)
from ..models.chat.user_hidden import UserMessageHidden
from ..models.chat.participants import ChatParticipant

class MessageRepository(BaseRepository[Message]):
    model = Message

    # ------------------------------------------------------------------ #
    # Query helpers
    # ------------------------------------------------------------------ #
    def get_queryset(self) -> QuerySet[Message]:
        return (
            super()
            .get_queryset()
            .select_related("sender", "reply_to", "reply_to__sender")
            .prefetch_related("reactions", "reactions__user")
        )

    def for_chat(
        self,
        chat_id: uuid.UUID,
        *,
        viewer_id: Optional[uuid.UUID] = None,
    ) -> QuerySet[Message]:
        """Return messages in a chat, hiding ``FOR_EVERYONE`` tombstones
        appropriately and excluding ``FOR_ME`` rows for ``viewer_id``.

        Soft-deleted ``FOR_EVERYONE`` messages are kept (rendered as "This
        message was deleted" bubbles) but their content will be blanked out
        at the serializer layer.
        """
        # We intentionally keep both live messages and FOR_EVERYONE
        # tombstones (serializer renders tombstones as "message deleted").
        # FOR_ME rows are filtered via the UserMessageHidden join below.
        qs = self.get_queryset().filter(chat_id=chat_id)
        if viewer_id is not None:
            hidden_subquery = UserMessageHidden.objects.filter(
                user_id=viewer_id,
                message_id=OuterRef("id"),
            )
            qs = qs.annotate(_hidden=Exists(hidden_subquery)).filter(_hidden=False)
        return qs

    def history_page(
        self,
        chat_id: uuid.UUID,
        *,
        viewer_id: uuid.UUID,
        cursor: Optional[uuid.UUID] = None,
        before: bool = True,
        limit: int = 50,
    ) -> QuerySet[Message]:
        """Simple cursor-based pagination over message history.

        * ``before=True`` (default) loads older messages than ``cursor``.
        * ``before=False`` loads newer messages (catch-up on reconnect).
        """
        qs = self.for_chat(chat_id, viewer_id=viewer_id)
        if cursor:
            anchor = self.get_or_none(id=cursor)
            if anchor is not None:
                if before:
                    qs = qs.filter(created_at__lt=anchor.created_at)
                else:
                    qs = qs.filter(created_at__gt=anchor.created_at)
        order = "-created_at" if before else "created_at"
        return qs.order_by(order)[:limit]
    

    def get_by_client_msg_id(
        self, sender_id: uuid.UUID, client_msg_id: uuid.UUID
    ) -> Optional[Message]:
        """Idempotency lookup for retries."""
        return self.get_or_none(sender_id=sender_id, client_msg_id=client_msg_id)

    # ------------------------------------------------------------------ #
    # Mutations
    # ------------------------------------------------------------------ #
    def create_message(
        self,
        *,
        chat_id: uuid.UUID,
        sender_id: uuid.UUID,
        content: str,
        reply_to_id: Optional[uuid.UUID] = None,
        client_msg_id: Optional[uuid.UUID] = None,
    ) -> Message:
        return self.create(
            chat_id=chat_id,
            sender_id=sender_id,
            content=content,
            reply_to_id=reply_to_id,
            client_msg_id=client_msg_id,
        )

    def mark_chat_seen_up_to(
        self,
        *,
        chat_id: uuid.UUID,
        user_id: uuid.UUID,
        message_id: uuid.UUID,
    ) -> None:
        """Bulk-set SEEN receipts for every message in the chat up to and
        including ``message_id`` and update the participant watermark."""
        anchor = self.get_or_none(id=message_id, chat_id=chat_id)

        if anchor is None:
            return

        now = timezone.now()

        # Per-message receipts (for users other than the sender — sender
        # doesn't need a receipt on their own message).
        messages_to_mark = Message.objects.filter(
            chat_id=chat_id,
            created_at__lte=anchor.created_at
        ).exclude(sender_id=user_id)

        existing_recipient_ids = set(
            MessageStatus.objects.filter(
                message__chat_id=chat_id,
                user_id=user_id,
                status=MessageStatus.Status.SEEN,
            ).values_list("message_id", flat=True)
        )
        new_receipts = [
            MessageStatus(
                message_id=m.id,
                user_id=user_id,
                status=MessageStatus.Status.SEEN,
                delivered_at=now,
                seen_at=now,
            )
            for m in messages_to_mark
            if m.id not in existing_recipient_ids
        ]
        MessageStatus.objects.bulk_create(new_receipts, ignore_conflicts=True)

        # Participant-level watermark.
        ChatParticipant.objects.filter(
            chat_id=chat_id, user_id=user_id
        ).update(last_read_at=now)