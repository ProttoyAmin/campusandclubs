

from apps.realtime.events import WSEvent, chat_group
from apps.realtime.consumers import AppSocketConsumer
from django.db.models import QuerySet
import uuid
from core.services import BaseService
from ..models import Chat
from ..repositories import ChatRepository

class ChatService(BaseService[Chat]):
    repository_class = ChatRepository
    _repository: ChatRepository | None = None

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