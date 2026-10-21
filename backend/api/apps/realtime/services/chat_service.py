

from apps.realtime.broadcast import broadcast_to_user_sync
from apps.realtime.dtos import ReceiptDTO
from apps.realtime.broadcast import broadcast_sync
from apps.realtime.serializers import ChatSerializer
from apps.realtime.dtos import ChatStartDTO
from apps.realtime.serializers import MessageSerializer
from apps.realtime.events import ChannelsHandler
from collections.abc import Sequence
from apps.realtime.dtos import MessageSendDTO
from apps.realtime.dtos import MessageListQueryDTO
from apps.realtime.policies import ChatPolicy
from apps.realtime.repositories.participant_repo import ChatParticipantRepository
from apps.accounts.models import User
from typing import Optional
from apps.realtime.models import ChatParticipant
from apps.realtime.models.chat.enums import ChatType
from apps.realtime.dtos.chat import ChatActionDTO
from apps.realtime.events import WSEvent, chat_group
from apps.realtime.consumers import AppSocketConsumer

from django.db.models import QuerySet
from django.core.exceptions import PermissionDenied, ValidationError
from django.utils import timezone
from django.db import IntegrityError, transaction
import logging


import uuid
from core.services import BaseService
from ..models import Chat, Message
from ..repositories import ChatRepository, MessageRepository


logger = logging.getLogger(__name__)

class ChatService(BaseService[Chat, ChatRepository]):
    repository_class = ChatRepository
    _repository: ChatRepository | None = None

    def __init__(self, actor: Optional[User] = None) -> None:
        super().__init__(actor=actor)
        self.participants = ChatParticipantRepository()
        self.messages = MessageRepository()

    def get_repository(self) -> ChatRepository:
        if self._repository is None:
            self._repository = self.repository_class()
        return self._repository

    def get_user_chats(self, user_id: uuid.UUID) -> QuerySet[Chat]:
        return self.get_repository().get_user_chats(user_id)
    
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
    
    def get_or_create_chat(self, user_ids: list[uuid.UUID]) -> Chat:
        return self.get_repository().get_or_create_chat(user_ids)
    
    async def handle_chat_join(self, consumer: AppSocketConsumer, chat_id: uuid.UUID):
        is_member = await consumer.user_in_room(chat_id)
        
        if not is_member:
            await consumer.send_json({"type": WSEvent.ERROR, "detail": "Not a member of this room"})
            return
        await consumer.channel_layer.group_add(chat_group(chat_id), self.consumer.channel_name)
        consumer.joined_chats.add(chat_id)

    def accept_chat(self, dto: ChatActionDTO) -> Chat:
        """Accept a pending DM: flip the actor's participant row from PENDING
        to ACCEPTED and notify the sender. ``chat_id`` is a Chat id."""
        self._require_actor()
        chat = self.repository.get_with_participants(dto.chat_id)

        if chat is None:
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
            ChannelsHandler.CHAT_MESSAGE_SEEN,
            {
                "chat_id": str(chat.id),
                "user_id": str(self.actor.id),
                "message_id": str(dto.message_id),
                "seen_at": timezone.now().isoformat(),
            },
        )

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
        client_msg_id: Optional[uuid.UUID] = None,
    ) -> Message:
        message = self.messages.create_message(
            chat_id=chat.id,
            sender_id=self.actor.id,
            content=content,
            reply_to_id=reply_to_id,
            client_msg_id=client_msg_id,
        )
        return message

    def send_message(self, chat_id: uuid.UUID, dto: MessageSendDTO) -> Message:
        self._require_actor()
        chat = self.repository.get_with_participants(chat_id)

        if chat is None:
            raise ValidationError('Chat not found')

        if not ChatPolicy(self.actor, chat).can_send_message():
            raise PermissionDenied('You are not allowed to send messages here.')

        if dto.client_msg_id:
            existing = self.messages.get_by_client_msg_id(self.actor.id, dto.client_msg_id)
            if existing is not None:
                return existing
        
        with transaction.atomic():
            message = self._persist_message(
                chat=chat,
                content=dto.content,
                reply_to_id=dto.reply_to,
                client_msg_id=dto.client_msg_id,
            )

            other_user_ids = [
                p.user_id for p in self.participants.accepted_for_chat(chat.id)
                if p.user_id != self.actor.id
            ]
            self._create_initial_receipts(message.id, other_user_ids)
            self.repository.touch_last_message(chat, message.created_at)
        
        payload = MessageSerializer(message).data
        broadcast_sync(chat.id, ChannelsHandler.CHAT_MESSAGE, payload)
        return message

    def start_chat(self, dto: ChatStartDTO) -> Chat:
        self._require_actor()

        if not dto.participant_ids or len(dto.participant_ids) == 0:
            raise ValidationError("Cannot start a chat with yourself only.")

        others = list(User.objects.filter(id__in=dto.participant_ids))
        if len(others) != len(dto.participant_ids):
            raise ValidationError("One or more users not found.")

        is_group = len(others) > 1
        new_chat: bool = False

        with transaction.atomic():
            chat = None
            is_new = True

            if not is_group:
                other_user: User = others[0]

                chat = (
                    Chat.objects.filter(type=ChatType.DIRECT, participants__user=self.actor)
                    .filter(participants__user=other_user)
                    .first()
                )
                is_new = chat is None

            if not is_new and chat is not None:
                chat_policy = ChatPolicy(self.actor, chat)
                if not chat_policy.can_send_message():
                    raise PermissionDenied("You cannot send messages to this chat.")

            if is_new:
                new_chat = is_new
                chat = Chat.objects.create(
                    type=ChatType.GROUP if is_group else ChatType.DIRECT,
                    name=dto.name or None if is_group else others[0].username,
                )
                ChatParticipant.objects.create(
                    chat=chat, user=self.actor,
                    status=ChatParticipant.Status.ACCEPTED, is_admin=is_group,
                )
                policy = ChatPolicy(self.actor, chat)
                for other in others:
                    can_auto_accept = is_group or policy.can_start_dm(other)
                    ChatParticipant.objects.create(
                        chat=chat, user=other,
                        status=ChatParticipant.Status.ACCEPTED if can_auto_accept else ChatParticipant.Status.PENDING,
                    )

            message = self._persist_message(
                chat=chat,
                content=dto.content,
                reply_to_id=None,
                client_msg_id=None,
            )

            self._create_initial_receipts(
                message_id=message.id,
                recipient_ids=[p.user_id for p in chat.participants.all() if p.user_id != self.actor.id]
            )
            self.repository.touch_last_message(chat, message.created_at)

        logger.info(f"Chat: {chat.id} Chat Type: {chat.type}")
        payload = {
            "chat": ChatSerializer(chat).data,
            "message": MessageSerializer(message).data,
            "created": new_chat,
        }
        for participant in chat.participants.all():
            broadcast_to_user_sync(participant.user_id, ChannelsHandler.CHAT_START, payload)

        return chat, new_chat, message


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