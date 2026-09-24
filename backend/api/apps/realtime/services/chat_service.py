

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


import uuid
from core.services import BaseService
from ..models import Chat
from ..repositories import ChatRepository

class ChatService(BaseService[Chat, ChatRepository]):
    repository_class = ChatRepository
    _repository: ChatRepository | None = None

    def __init__(self, actor: Optional[User] = None) -> None:
        super().__init__(actor=actor)
        self.participants = ChatParticipantRepository()

    def get_repository(self) -> ChatRepository:
        if self._repository is None:
            self._repository = self.repository_class()
        return self._repository

    def get_user_chats(self, user_id: uuid.UUID) -> QuerySet[Chat]:
        return self.get_repository().get_user_chats(user_id)
    
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

    # ------------------------------------------------------------------ #
    # Internal helpers
    # ------------------------------------------------------------------ #
    def _require_actor(self) -> None:
        if self.actor is None or not getattr(self.actor, "is_authenticated", False):
            raise PermissionDenied("Authentication required.")