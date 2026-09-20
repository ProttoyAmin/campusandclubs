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
    MessageAttachment,
    MessageDeleteMode,
    MessageStatus,
)
from ..models.chat.participants import ChatParticipant
from ..models.chat.user_hidden import UserMessageHidden


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
            .prefetch_related("attachments", "reactions", "reactions__user")
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

    def get_by_id(self, message_id: uuid.UUID) -> Optional[Message]:
        return self.get_or_none(id=message_id)

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
        msg_type: str = "TEXT",
        reply_to_id: Optional[uuid.UUID] = None,
        client_msg_id: Optional[uuid.UUID] = None,
    ) -> Message:
        return self.create(
            chat_id=chat_id,
            sender_id=sender_id,
            content=content,
            msg_type=msg_type,
            reply_to_id=reply_to_id,
            client_msg_id=client_msg_id,
        )

    def create_attachments(
        self, message: Message, attachments: Iterable
    ) -> list[MessageAttachment]:
        objs = [
            MessageAttachment(
                message=message,
                kind=getattr(a, "kind", "file"),
                file_url=a.file_url,
                thumb_url=getattr(a, "thumb_url", None),
                file_name=getattr(a, "file_name", None),
                mime_type=getattr(a, "mime_type", None),
                size_bytes=getattr(a, "size_bytes", None),
                width=getattr(a, "width", None),
                height=getattr(a, "height", None),
                duration_ms=getattr(a, "duration_ms", None),
            )
            for a in attachments
        ]
        return MessageAttachment.objects.bulk_create(objs)

    def set_receipt(
        self,
        *,
        message_id: uuid.UUID,
        user_id: uuid.UUID,
        status: str,
    ) -> MessageStatus:
        """Upsert a per-recipient receipt and bump timestamps forward.

        Receipts are monotonic: SENT → DELIVERED → SEEN, never backward.
        """
        RANK = {
            MessageStatus.Status.SENT: 0,
            MessageStatus.Status.DELIVERED: 1,
            MessageStatus.Status.SEEN: 2,
        }
        now = timezone.now()
        obj, created = MessageStatus.objects.get_or_create(
            message_id=message_id,
            user_id=user_id,
            defaults={"status": status},
        )
        target_rank = RANK.get(status, 0)
        current_rank = RANK.get(obj.status, -1)
        update_fields: list[str] = []
        if target_rank > current_rank:
            obj.status = status
            update_fields.append("status")
        if status == MessageStatus.Status.DELIVERED and not obj.delivered_at:
            obj.delivered_at = now
            update_fields.append("delivered_at")
        if status == MessageStatus.Status.SEEN and not obj.seen_at:
            obj.seen_at = now
            update_fields.append("seen_at")
        if update_fields:
            obj.save(update_fields=update_fields)
        return obj

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
            created_at__lte=anchor.created_at,
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

    def soft_delete(self, message: Message, *, mode: str, actor_id: uuid.UUID) -> None:
        from ..models.chat.user_hidden import UserMessageHidden

        now = timezone.now()
        if mode == MessageDeleteMode.FOR_EVERYONE:
            # Only the sender can delete for everyone (service enforces
            # this too — belt & suspenders).
            if message.sender_id != actor_id:
                return
            message.deleted_mode = MessageDeleteMode.FOR_EVERYONE
            message.content = ""
            message.deleted_at = now
            message.save(update_fields=["deleted_mode", "content", "deleted_at"])
        else:
            UserMessageHidden.objects.get_or_create(user_id=actor_id, message=message)
