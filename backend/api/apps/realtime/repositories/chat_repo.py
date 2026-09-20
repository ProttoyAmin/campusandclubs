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