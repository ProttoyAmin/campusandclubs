"""ChatService — business-logic layer for chat, messages, reactions, and
message requests.

The service is the only place that orchestrates repositories, policies,
WebSocket broadcasts, and cross-cutting concerns (idempotency, unread
watermarks, denormalized timestamps). Views and WebSocket handlers become
thin adapters that validate input, construct a DTO, call the service, and
return a serialized response.
"""
from __future__ import annotations

import uuid
from dataclasses import asdict
from typing import Optional, Sequence

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError, transaction
from django.db.models import QuerySet
from django.utils import timezone

from apps.accounts.models import User
from apps.connections.models import Block
from core.services import BaseService

from ..broadcast import broadcast_to_user_sync, broadcast_sync
from ..dtos.chat import ChatActionDTO, ChatCreateDTO, ChatStartDTO, GroupChatCreateDTO
from ..dtos.message import (
    MessageAttachmentDTO,
    MessageEditDTO,
    MessageListQueryDTO,
    MessageSendDTO,
    ReactionDTO,
    ReceiptDTO,
)
from ..events import ChannelsEvent, WSEvent
from ..models.chat.chat import Chat
from ..models.chat.enums import ChatType
from ..models.chat.message import (
    Message,
    MessageAttachment,
    MessageAttachmentKind,
    MessageDeleteMode,
    MessageStatus,
    MessageType,
)
from ..models.chat.message_request import MessageRequest
from ..models.chat.participants import ChatParticipant
from ..policies.chat import ChatPolicy
from ..policies.message import MessagePolicy
from ..repositories.chat_repo import ChatRepository
from ..repositories.message_repo import MessageRepository
from ..repositories.participant_repo import ChatParticipantRepository
from ..repositories.reaction_repo import MessageReactionRepository
from ..repositories.request_repo import MessageRequestRepository
from apps.media.repositories import MediaRepository
from apps.media.models import MediaRole
from mimetypes import guess_type


class ChatService(BaseService[Chat, ChatRepository]):
    """Coordinates chat workflows. Inherits ``self.actor`` and a default
    ``self.repository`` (a ``ChatRepository``) from ``BaseService``."""

    repository_class = ChatRepository

    def __init__(self, actor: Optional[User] = None) -> None:
        super().__init__(actor=actor)
        # Extra repositories
        self.messages = MessageRepository()
        self.participants = ChatParticipantRepository()
        self.reactions = MessageReactionRepository()
        self.requests = MessageRequestRepository()
        self.media = MediaRepository()

    # ------------------------------------------------------------------ #
    # Listing
    # ------------------------------------------------------------------ #
    def list_my_chats(self) -> QuerySet[Chat]:
        """Chat list for the sidebar: accepted chats only."""
        self._require_actor()
        return self.repository.for_user(self.actor.id)

    def list_message_requests(self) -> QuerySet[MessageRequest]:
        """Pending message requests addressed to the actor."""
        self._require_actor()
        return self.requests.pending_for_recipient(self.actor.id)

    def get_chat_or_403(self, chat_id: uuid.UUID) -> Chat:
        chat = self.repository.get_with_participants(chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        policy = ChatPolicy(self.actor, chat)
        if not policy.can_view():
            raise PermissionDenied("You are not a member of this chat.")
        return chat

    def list_messages(self, dto: MessageListQueryDTO):
        """Paginated message history for a chat the actor can view."""
        chat = self.get_chat_or_403(dto.chat_id)
        return self.messages.history_page(
            chat.id,
            viewer_id=self.actor.id,
            cursor=dto.cursor,
            before=dto.before,
            limit=dto.limit,
        )

    # ------------------------------------------------------------------ #
    # Chat creation: DMs, groups, start-with-first-message
    # ------------------------------------------------------------------ #
    def start_direct(self, dto: ChatCreateDTO) -> tuple[Chat, bool]:
        """Get-or-create a DM. Returns ``(chat, is_new)``.

        If a prior DECLINED request exists we raise PermissionDenied to
        prevent spam re-opens. If a chat is already ACCEPTED we return it.
        Otherwise we create a MessageRequest + a PENDING chat and notify
        the recipient.
        """
        self._require_actor()
        other = User.objects.filter(id=dto.participant_id).first()
        if other is None:
            raise ValidationError("Recipient not found.")
        if not ChatPolicy(self.actor, None).can_start_dm_with(other):
            raise PermissionDenied("You cannot start a chat with this user.")

        existing = self.repository.find_direct_between(self.actor.id, other.id)
        if existing is not None:
            return existing, False

        with transaction.atomic():
            chat = self.repository.create_chat(type=ChatType.DIRECT)
            # Sender is ACCEPTED, recipient is PENDING (message request).
            self.participants.add(
                chat_id=chat.id, user_id=self.actor.id, status=ChatParticipant.Status.ACCEPTED
            )
            self.participants.add(
                chat_id=chat.id, user_id=other.id, status=ChatParticipant.Status.PENDING
            )
            # Create out-of-band request record for the "requests" inbox.
            req = self.requests.create_request(
                from_user_id=self.actor.id,
                to_user_id=other.id,
                content="",
            )
            req.chat = chat
            req.save(update_fields=["chat"])
            self.repository.touch_last_message(chat, timezone.now())

        # Notify the recipient over their personal channel.
        from ..serializers import ChatSerializer
        broadcast_to_user_sync(
            other.id,
            ChannelsEvent.CHAT_REQUEST_NEW,
            {"chat": ChatSerializer(chat, context={"user": self.actor}).data},
        )
        return chat, True

    def create_group(self, dto: GroupChatCreateDTO) -> Chat:
        self._require_actor()
        member_ids = {uid for uid in dto.participant_ids if uid != self.actor.id}
        if not member_ids:
            raise ValidationError("Add at least one other member.")
        users = User.objects.filter(id__in=member_ids)
        if users.count() != len(member_ids):
            raise ValidationError("One or more users were not found.")

        with transaction.atomic():
            chat = self.repository.create_chat(
                type=ChatType.GROUP,
                name=dto.name,
                description=dto.description,
            )
            self.participants.add(
                chat_id=chat.id,
                user_id=self.actor.id,
                status=ChatParticipant.Status.ACCEPTED,
                is_admin=True,
                is_owner=True,
            )
            self.participants.bulk_add(chat.id, member_ids)

        return chat

    def start_chat_and_send(self, dto: ChatStartDTO) -> tuple[Chat, Message, bool]:
        """Existing "ChatStart" flow: get-or-create DM/group and send first
        message atomically. Kept for backward compat with the clients."""
        self._require_actor()
        other_ids = {pid for pid in dto.participant_ids if pid != self.actor.id}
        if not other_ids:
            raise ValidationError("Cannot start a chat with yourself only.")

        others = list(User.objects.filter(id__in=other_ids))
        if len(others) != len(other_ids):
            raise ValidationError("One or more users not found.")
        for other in others:
            if Block.has_blocked_each_other(self.actor, other):
                raise PermissionDenied("Blocked users cannot start a chat.")

        is_group = len(others) > 1
        with transaction.atomic():
            chat: Optional[Chat] = None
            is_new = True
            if not is_group:
                other = others[0]
                chat = self.repository.find_direct_between(self.actor.id, other.id)
                is_new = chat is None
                if chat is None:
                    chat = self.repository.create_chat(type=ChatType.DIRECT)
                    self.participants.add(
                        chat_id=chat.id, user_id=self.actor.id,
                        status=ChatParticipant.Status.ACCEPTED,
                    )
                    self.participants.add(
                        chat_id=chat.id, user_id=other.id,
                        status=ChatParticipant.Status.PENDING,
                    )
                    req = self.requests.create_request(
                        from_user_id=self.actor.id,
                        to_user_id=other.id,
                        content=dto.content,
                    )
                    req.chat = chat
                    req.save(update_fields=["chat"])
            else:
                chat = self.repository.create_chat(
                    type=ChatType.GROUP, name=dto.name or None
                )
                self.participants.add(
                    chat_id=chat.id, user_id=self.actor.id,
                    status=ChatParticipant.Status.ACCEPTED,
                    is_admin=True, is_owner=True,
                )
                self.participants.bulk_add(chat.id, [u.id for u in others])

            message = self._persist_message(
                chat=chat,
                content=dto.content,
                client_msg_id=dto.client_msg_id,
            )
            self.repository.touch_last_message(chat, message.created_at)

        self._after_message_hook(chat=chat, message=message, is_new_chat=is_new)
        return chat, message, is_new

    # ------------------------------------------------------------------ #
    # Message requests (accept / decline)
    # ------------------------------------------------------------------ #
    def accept_chat(self, dto: ChatActionDTO) -> Chat:
        """Accept a pending DM. ``chat_id`` may be either the chat id or a
        MessageRequest id; we resolve either. Flips the actor's participant
        row to ACCEPTED and notifies the sender."""
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)
        # If the id refers to a MessageRequest instead of a Chat, resolve.
        request = None
        if chat is None:
            request = self.requests.get_or_none(id=dto.chat_id, to_user=self.actor, status=MessageRequest.Status.PENDING)
            if request is not None and request.chat_id is not None:
                chat = self.repository.get_with_participants(request.chat_id)
        if chat is None or chat.type != ChatType.DIRECT:
            raise ValidationError("Chat not found or is not a direct chat.")
        me = self.participants.get(chat.id, self.actor.id)
        if me is None or me.status != ChatParticipant.Status.PENDING:
            raise ValidationError("There is no pending request for this chat.")
        with transaction.atomic():
            self.participants.update_status(me, status=ChatParticipant.Status.ACCEPTED)
            other_participants = [
                p for p in chat.participants.all() if p.user_id != self.actor.id
            ]
            MessageRequest.objects.filter(
                to_user=self.actor,
                chat=chat,
                status=MessageRequest.Status.PENDING,
            ).update(status=MessageRequest.Status.ACCEPTED)
            # Also mark any request without a linked chat (legacy rows).
            MessageRequest.objects.filter(
                to_user=self.actor,
                chat__isnull=True,
                from_user_id__in=[p.user_id for p in other_participants],
                status=MessageRequest.Status.PENDING,
            ).update(status=MessageRequest.Status.ACCEPTED, chat=chat)

        from ..serializers import ChatSerializer
        other_ids = [p.user_id for p in other_participants]
        for uid in other_ids:
            broadcast_to_user_sync(uid, ChannelsEvent.CHAT_REQUEST_ACCEPTED, {
                "chat": ChatSerializer(chat, context={"user": self.actor}).data,
            })
        return chat

    def decline_chat(self, dto: ChatActionDTO) -> None:
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)
        request = None
        if chat is None:
            request = self.requests.get_or_none(id=dto.chat_id, to_user=self.actor, status=MessageRequest.Status.PENDING)
            if request is not None and request.chat_id is not None:
                chat = self.repository.get_with_participants(request.chat_id)
        if chat is None and request is None:
            raise ValidationError("Chat not found.")
        with transaction.atomic():
            if chat is not None:
                me = self.participants.get(chat.id, self.actor.id)
                if me is not None:
                    self.participants.update_status(me, status=ChatParticipant.Status.DECLINED)
                MessageRequest.objects.filter(
                    to_user=self.actor, chat=chat, status=MessageRequest.Status.PENDING,
                ).update(status=MessageRequest.Status.DECLINED)
            elif request is not None:
                request.status = MessageRequest.Status.DECLINED
                request.save(update_fields=["status", "updated_at"])

    # ------------------------------------------------------------------ #
    # Message send / edit / delete / react / mark-seen
    # ------------------------------------------------------------------ #
    def send_message(self, chat_id: uuid.UUID, dto: MessageSendDTO) -> Message:
        self._require_actor()
        chat = self.repository.get_with_participants(chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        if not ChatPolicy(self.actor, chat).can_send_message():
            raise PermissionDenied("You are not allowed to send messages here.")

        # Idempotency for client retries.
        if dto.client_msg_id:
            existing = self.messages.get_by_client_msg_id(self.actor.id, dto.client_msg_id)
            if existing is not None:
                return existing

        with transaction.atomic():
            message = self._persist_message(
                chat=chat,
                content=dto.content,
                reply_to_id=dto.reply_to,
                msg_type=dto.msg_type,
                client_msg_id=dto.client_msg_id,
                attachments=dto.attachments,
                files=dto.files,
            )
            other_user_ids = [
                p.user_id for p in self.participants.accepted_for_chat(chat.id)
                if p.user_id != self.actor.id
            ]
            self._create_initial_receipts(message.id, other_user_ids)
            self.repository.touch_last_message(chat, message.created_at)

        self._after_message_hook(chat=chat, message=message, is_new_chat=False)
        return message

    def edit_message(self, message_id: uuid.UUID, dto: MessageEditDTO) -> Message:
        self._require_actor()
        message = self.messages.get_by_id(message_id)
        if message is None:
            raise ValidationError("Message not found.")
        if not MessagePolicy(self.actor, message).can_edit():
            raise PermissionDenied("You cannot edit this message.")
        message.content = dto.content
        message.edited_at = timezone.now()
        message.save(update_fields=["content", "edited_at"])
        from ..serializers import MessageSerializer
        broadcast_sync(
            message.chat_id,
            ChannelsEvent.CHAT_MESSAGE_EDIT,
            MessageSerializer(message).data,
        )
        return message

    def delete_message(self, message_id: uuid.UUID, *, mode: str) -> Message:
        self._require_actor()
        message = self.messages.get_by_id(message_id)
        if message is None:
            raise ValidationError("Message not found.")
        policy = MessagePolicy(self.actor, message)
        if mode == MessageDeleteMode.FOR_EVERYONE:
            if not policy.can_delete_for_everyone():
                raise PermissionDenied("You cannot unsend this message for everyone.")
        else:
            if not policy.can_delete_for_me():
                raise PermissionDenied("You cannot delete this message.")
            mode = MessageDeleteMode.FOR_ME
        self.messages.soft_delete(message, mode=mode, actor_id=self.actor.id)
        broadcast_sync(
            message.chat_id,
            ChannelsEvent.CHAT_MESSAGE_DELETE,
            {
                "id": str(message.id),
                "chat_id": str(message.chat_id),
                "mode": mode,
                "actor_id": str(self.actor.id),
            },
        )
        return message

    def toggle_reaction(self, dto: ReactionDTO) -> tuple[dict, bool]:
        """Toggle an emoji reaction. Returns ``(payload, created)`` where
        ``payload`` is the wire payload for the WS event / REST response."""
        self._require_actor()
        message = self.messages.get_by_id(dto.message_id)
        if message is None:
            raise ValidationError("Message not found.")
        if not MessagePolicy(self.actor, message).can_react():
            raise PermissionDenied("You cannot react to this message.")
        with transaction.atomic():
            reaction, created = self.reactions.toggle(
                message_id=message.id, user_id=self.actor.id, emoji=dto.emoji,
            )
        payload = {
            "message_id": str(message.id),
            "chat_id": str(message.chat_id),
            "user_id": str(self.actor.id),
            "emoji": dto.emoji,
        }
        broadcast_sync(
            message.chat_id,
            ChannelsEvent.CHAT_MESSAGE_REACTION_ADD if created else ChannelsEvent.CHAT_MESSAGE_REACTION_REMOVE,
            payload,
        )
        return payload, created

    def mark_seen(self, dto: ReceiptDTO) -> None:
        """Mark messages up to ``dto.message_id`` as seen by the actor."""
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        me = self.participants.get(chat.id, self.actor.id)
        if me is None or me.status != ChatParticipant.Status.ACCEPTED:
            raise PermissionDenied("You are not a member of this chat.")
        self.messages.mark_chat_seen_up_to(
            chat_id=chat.id,
            user_id=self.actor.id,
            message_id=dto.message_id,
        )
        broadcast_sync(
            chat.id,
            ChannelsEvent.CHAT_MESSAGE_SEEN,
            {
                "chat_id": str(chat.id),
                "user_id": str(self.actor.id),
                "message_id": str(dto.message_id),
                "seen_at": timezone.now().isoformat(),
            },
        )

    def mark_delivered(self, message_id: uuid.UUID) -> None:
        """Mark a single message delivered to the actor (called from
        WS client-ACKs)."""
        self._require_actor()
        self.messages.set_receipt(
            message_id=message_id,
            user_id=self.actor.id,
            status=MessageStatus.Status.DELIVERED,
        )

    # ------------------------------------------------------------------ #
    # WS-facing helpers
    # ------------------------------------------------------------------ #
    def user_can_join_chat(self, chat_id: uuid.UUID) -> bool:
        chat = self.repository.get_with_participants(chat_id)
        return chat is not None and ChatPolicy(self.actor, chat).can_view_history()

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #
    def _require_actor(self) -> None:
        if self.actor is None or not getattr(self.actor, "is_authenticated", False):
            raise PermissionDenied("Authentication required.")

    def _persist_message(
        self,
        *,
        chat: Chat,
        content: str,
        reply_to_id: Optional[uuid.UUID] = None,
        msg_type: str = MessageType.TEXT,
        client_msg_id: Optional[uuid.UUID] = None,
        attachments: Sequence[MessageAttachmentDTO] = (),
        files: Sequence = (),
    ) -> Message:
        message = self.messages.create_message(
            chat_id=chat.id,
            sender_id=self.actor.id,
            content=content,
            msg_type=msg_type,
            reply_to_id=reply_to_id,
            client_msg_id=client_msg_id,
        )

        created_attachments: list[MessageAttachment] = []

        # 1) Raw uploaded files (multipart send endpoint) — persist them to
        #    Cloudinary via the Media repository first, then link rows.
        if files:
            media_rows = self.media.attach_files(
                obj=message,
                files=files,
                role=MediaRole.ATTACHMENT,
            )
            for media in media_rows:
                secure_url = media.file.source(secure=True) if hasattr(media.file, "source") else media.file.url
                kind = self._guess_kind(media)
                created_attachments.append(
                    MessageAttachment(
                        message=message,
                        media=media,
                        kind=kind,
                        file_url=media.file.url,
                        thumb_url=secure_url if kind == MessageAttachmentKind.IMAGE else None,
                        file_name=media.original_file_name or None,
                        mime_type=guess_type(media.original_file_name or "")[0]
                        if media.original_file_name else None,
                    )
                )

        # 2) Pre-created attachment references (JSON send endpoint).
        for a in attachments:
            media_row = None
            if a.media_id:
                media_row = self.media.get_or_none(id=a.media_id)
            created_attachments.append(
                MessageAttachment(
                    message=message,
                    media=media_row,
                    kind=a.kind,
                    file_url=a.file_url,
                    thumb_url=a.thumb_url,
                    file_name=a.file_name,
                    mime_type=a.mime_type,
                    size_bytes=a.size_bytes,
                    width=a.width,
                    height=a.height,
                    duration_ms=a.duration_ms,
                )
            )

        if created_attachments:
            MessageAttachment.objects.bulk_create(created_attachments)

        # If the message has attachments but no explicit msg_type was set,
        # pick a reasonable default (first attachment kind, or IMAGE).
        if created_attachments and msg_type == MessageType.TEXT and not content:
            first_kind = created_attachments[0].kind
            mapping = {
                MessageAttachmentKind.IMAGE: MessageType.IMAGE,
                MessageAttachmentKind.VIDEO: MessageType.VIDEO,
                MessageAttachmentKind.AUDIO: MessageType.VOICE,
                MessageAttachmentKind.FILE: MessageType.FILE,
            }
            message.msg_type = mapping.get(first_kind, MessageType.FILE)
            message.save(update_fields=["msg_type"])

        return message

    @staticmethod
    def _guess_kind(media) -> str:
        rt = getattr(media.file, "resource_type", "raw")
        name = (media.original_file_name or "").lower()
        if rt == "image":
            return MessageAttachmentKind.IMAGE
        if rt == "video":
            if name.endswith((".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac", ".opus")):
                return MessageAttachmentKind.AUDIO
            return MessageAttachmentKind.VIDEO
        return MessageAttachmentKind.FILE

    def _create_initial_receipts(
        self, message_id: uuid.UUID, recipient_ids: Sequence[uuid.UUID]
    ) -> None:
        """Populate SENT receipts for every other participant, so we can
        track delivery/read progression without N+1 lookups later."""
        from ..models.chat.message import MessageStatus as _MS
        now = timezone.now()
        # Sender's own receipt is immediately SEEN (they authored it).
        _MS.objects.get_or_create(
            message_id=message_id,
            user_id=self.actor.id,
            defaults={
                "status": _MS.Status.SEEN,
                "delivered_at": now,
                "seen_at": now,
            },
        )
        created = [
            _MS(
                message_id=message_id,
                user_id=uid,
                status=_MS.Status.SENT,
            )
            for uid in recipient_ids
        ]
        _MS.objects.bulk_create(created, ignore_conflicts=True)

    def _after_message_hook(self, *, chat: Chat, message: Message, is_new_chat: bool) -> None:
        """Broadcast the new message and push a notification to users who
        aren't currently connected to the chat's group."""
        from ..serializers import MessageSerializer
        payload = MessageSerializer(message).data
        broadcast_sync(chat.id, ChannelsEvent.CHAT_MESSAGE, payload)

        # Send a lightweight "new message" ping over each recipient's personal
        # notification channel so that backgrounded clients can update
        # unread counts and OS notifications.
        other_ids = [
            p.user_id for p in self.participants.accepted_for_chat(chat.id)
            if p.user_id != self.actor.id
        ]
        ping = {
            "kind": "new_message",
            "chat_id": str(chat.id),
            "message_id": str(message.id),
            "sender_id": str(self.actor.id),
            "preview": (message.content or "")[:80],
            "created_at": message.created_at.isoformat(),
        }
        for uid in other_ids:
            broadcast_to_user_sync(uid, ChannelsEvent.NOTIFICATION, ping)
