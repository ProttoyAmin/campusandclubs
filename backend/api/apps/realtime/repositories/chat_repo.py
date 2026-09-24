from typing import Optional
from django.db.models import QuerySet
import uuid
from core.repositories import BaseRepository
from ..models import Chat

class ChatRepository(BaseRepository[Chat]):
    model = Chat

    def get_chat_by_id(self, chat_id: uuid.UUID) -> Chat | None:
        return self.get_or_none(id=chat_id)

    def get_user_chats(self, user_id: uuid.UUID) -> QuerySet[Chat]:
        return self.get_queryset().filter(participants__id=user_id)
    
    def get_or_create_chat(self, user_ids: list[uuid.UUID]) -> Chat:
        return self.model.objects.get_or_create(
            participants__id__in=user_ids,
            club__isnull=True,
        )
    
    def get_with_participants(self, chat_id: uuid.UUID) -> Optional[Chat]:
        return self.get_queryset().filter(id=chat_id).first()
    
    def touch_last_message(self, chat: Chat, when) -> Chat:
        chat.last_message_at = when
        chat.save(update_fields=["last_message_at", "updated_at"])
        return chat