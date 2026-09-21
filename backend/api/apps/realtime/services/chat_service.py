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
from ..models.chat.participants import ChatParticipant
from ..policies.chat import ChatPolicy, evaluate_message_gate
from ..policies.message import MessagePolicy
from ..repositories.chat_repo import ChatRepository
from ..repositories.message_repo import MessageRepository
from ..repositories.participant_repo import ChatParticipantRepository
from ..repositories.reaction_repo import MessageReactionRepository
from apps.media.repositories import MediaRepository
from apps.media.models import MediaRole
from mimetypes import guess_type


class ChatService(BaseService[Chat, ChatRepository]):
    """Coordinates chat workflows. Inherits ``self.actor`` and a default
    ``self.repository`` (a ``ChatRepository``) from ``BaseService``."""

    repository_class = ChatRepository

    def __init__(self, actor: Optional[User] = None) -> None:
        super().__init__(actor=actor)
        self.messages = MessageRepository()
        self.participants = ChatParticipantRepository()
        self.reactions = MessageReactionRepository()
        self.media = MediaRepository()

    # ------------------------------------------------------------------ #
    # Listing
    # ------------------------------------------------------------------ #
    def list_my_chats(self) -> QuerySet[Chat]:
        """Chat list for the sidebar: accepted chats only."""
        self._require_actor()
        return self.repository.for_user(self.actor.id)

    def list_message_requests(self) -> QuerySet[Chat]:
        """DMs where the actor is a PENDING participant — the requests inbox.
        Returns full Chat objects so the first message + other participant
        can be rendered without additional lookups."""
        self._require_actor()
        return self.repository.pending_for_user(self.actor.id)

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
    def _resolve_gate(self, other: User):
        """Run the message-request gate and raise PermissionDenied on block."""
        gate = evaluate_message_gate(self.actor, other)
        if gate.blocked:
            raise PermissionDenied(gate.reason)
        return gate

    def _resolve_existing_dm(self, other: User) -> Optional[Chat]:
        """Find an existing DM between the actor and ``other``."""
        return self.repository.find_direct_between(self.actor.id, other.id)

    def start_direct(self, dto: ChatCreateDTO) -> tuple[Chat, bool]:
        """Get-or-create a DM. Returns ``(chat, is_new)``.

        Both participants are always added up front:
          * sender    → ACCEPTED
          * recipient → ACCEPTED if gate.auto_accept (mutual follow),
                        PENDING  otherwise (lands in requests inbox).
        """
        self._require_actor()
        other = User.objects.filter(id=dto.participant_id).first()
        if other is None:
            raise ValidationError("Recipient not found.")

        gate = self._resolve_gate(other)
        existing = self._resolve_existing_dm(other)
        if existing is not None:
            # If the other participant is ACCEPTED already, reuse as-is.
            # If they DECLINED previously, flip them back to PENDING so the
            # sender can re-open the conversation.
            other_p = next((p for p in existing.participants.all() if p.user_id == other.id), None)
            if other_p is not None and other_p.status == ChatParticipant.Status.ACCEPTED:
                return existing, False
            with transaction.atomic():
                if other_p is None:
                    self.participants.add(
                        chat_id=existing.id, user_id=other.id,
                        status=ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING,
                    )
                else:
                    self.participants.update_status(
                        other_p,
                        status=ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING,
                    )
                self.repository.touch_last_message(existing, timezone.now())
            chat = existing
            is_new = False
            recipient_status = ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING
        else:
            with transaction.atomic():
                chat = self.repository.create_chat(type=ChatType.DIRECT)
                self.participants.add(chat_id=chat.id, user_id=self.actor.id, status=ChatParticipant.Status.ACCEPTED)
                recipient_status = ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING
                self.participants.add(chat_id=chat.id, user_id=other.id, status=recipient_status)
                self.repository.touch_last_message(chat, timezone.now())
            is_new = True

        from ..serializers import ChatSerializer
        broadcast_to_user_sync(
            other.id,
            ChannelsEvent.CHAT_REQUEST_ACCEPTED if recipient_status == ChatParticipant.Status.ACCEPTED else ChannelsEvent.CHAT_REQUEST_NEW,
            {"chat": ChatSerializer(chat, context={"user": self.actor}).data},
        )
        return chat, is_new

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
        """Backward-compat "start + first message" flow."""
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
                gate = self._resolve_gate(other)
                chat = self._resolve_existing_dm(other)
                is_new = chat is None
                if chat is None:
                    chat = self.repository.create_chat(type=ChatType.DIRECT)
                    self.participants.add(
                        chat_id=chat.id, user_id=self.actor.id,
                        status=ChatParticipant.Status.ACCEPTED,
                    )
                    self.participants.add(
                        chat_id=chat.id, user_id=other.id,
                        status=ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING,
                    )
                else:
                    other_p = next((p for p in chat.participants.all() if p.user_id == other.id), None)
                    if other_p is None:
                        self.participants.add(
                            chat_id=chat.id, user_id=other.id,
                            status=ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING,
                        )
                    elif other_p.status == ChatParticipant.Status.DECLINED:
                        # Re-open: reset to PENDING (or ACCEPTED if gate allows).
                        self.participants.update_status(
                            other_p,
                            status=ChatParticipant.Status.ACCEPTED if gate.auto_accept else ChatParticipant.Status.PENDING,
                        )
            else:
                chat = self.repository.create_chat(type=ChatType.GROUP, name=dto.name or None)
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
        if not is_group:
            other = others[0]
            from ..serializers import ChatSerializer
            other_p = chat.participants.filter(user_id=other.id, status=ChatParticipant.Status.ACCEPTED).exists()
            broadcast_to_user_sync(
                other.id,
                ChannelsEvent.CHAT_REQUEST_ACCEPTED if other_p else ChannelsEvent.CHAT_REQUEST_NEW,
                {"chat": ChatSerializer(chat, context={"user": self.actor}).data},
            )
        return chat, message, is_new

    # ------------------------------------------------------------------ #
    # Message requests (accept / decline)
    # ------------------------------------------------------------------ #
    def accept_chat(self, dto: ChatActionDTO) -> Chat:
        """Accept a pending DM: flip the actor's participant row from PENDING
        to ACCEPTED and notify the sender. ``chat_id`` is a Chat id."""
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)
        if chat is None or chat.type != ChatType.DIRECT:
            raise ValidationError("Chat not found or is not a direct chat.")
        me = self.participants.get(chat.id, self.actor.id)
        if me is None:
            raise ValidationError("You are not a participant in this chat.")
        if me.status == ChatParticipant.Status.ACCEPTED:
            return chat
        if me.status != ChatParticipant.Status.PENDING:
            raise ValidationError("There is no pending request for this chat.")
        with transaction.atomic():
            self.participants.update_status(me, status=ChatParticipant.Status.ACCEPTED)
            self.repository.touch_last_message(chat, timezone.now())

        from ..serializers import ChatSerializer
        other = next((p for p in chat.participants.all() if p.user_id != self.actor.id), None)
        if other is not None:
            broadcast_to_user_sync(other.user_id, ChannelsEvent.CHAT_REQUEST_ACCEPTED, {
                "chat": ChatSerializer(chat, context={"user": self.actor}).data,
            })
        return chat

    def decline_chat(self, dto: ChatActionDTO) -> None:
        """Decline a pending DM: flip the actor's participant row to DECLINED.
        The sender's side and any messages they sent are preserved but the
        chat is removed from the actor's inbox."""
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)
        if chat is None or chat.type != ChatType.DIRECT:
            raise ValidationError("Chat not found or is not a direct chat.")
        me = self.participants.get(chat.id, self.actor.id)
        if me is None:
            raise ValidationError("You are not a participant in this chat.")
        if me.status != ChatParticipant.Status.PENDING:
            raise ValidationError("There is no pending request for this chat.")
        with transaction.atomic():
            self.participants.update_status(me, status=ChatParticipant.Status.DECLINED)

    def leave_chat(self, chat_id: uuid.UUID) -> None:
        """Voluntarily leave an ACCEPTED chat (group/club/DM)."""
        self._require_actor()
        chat = self.repository.get_with_participants(chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        policy = ChatPolicy(self.actor, chat)
        if not policy.can_leave():
            raise PermissionDenied("You cannot leave this chat.")
        me = self.participants.get(chat.id, self.actor.id)
        with transaction.atomic():
            self.participants.update_status(me, status=ChatParticipant.Status.LEFT)

    def remove_member(self, chat_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Admin/owner kicks another ACCEPTED member (groups/clubs)."""
        self._require_actor()
        chat = self.repository.get_with_participants(chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        target = self.participants.get(chat.id, user_id)
        if target is None:
            raise ValidationError("That user is not in this chat.")
        policy = ChatPolicy(self.actor, chat)
        if not policy.can_remove_member(target):
            raise PermissionDenied("You are not allowed to remove this member.")
        with transaction.atomic():
            self.participants.update_status(target, status=ChatParticipant.Status.REMOVED)

    def block_chat(self, chat_id: uuid.UUID) -> None:
        """Block a DM: flip the actor's participant row to BLOCKED and
        auto-DECLINE any pending invite. For DMs only."""
        self._require_actor()
        chat = self.repository.get_with_participants(chat_id)
        if chat is None:
            raise ValidationError("Chat not found.")
        policy = ChatPolicy(self.actor, chat)
        if not policy.can_block():
            raise PermissionDenied("You cannot block this chat.")
        me = self.participants.get(chat.id, self.actor.id)
        with transaction.atomic():
            self.participants.update_status(me, status=ChatParticipant.Status.BLOCKED)

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
        if me is None or me.status not in (ChatParticipant.Status.ACCEPTED, ChatParticipant.Status.PENDING):
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
