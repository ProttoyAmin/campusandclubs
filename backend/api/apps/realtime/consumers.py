from typing import Any
import json
from django.utils import  timezone
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Chat
from apps.accounts.models import User
from .events import WSEvent, chat_group
import logging

logger = logging.getLogger(__name__)

class AppSocketConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user: User = self.scope["user"]

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.joined_chats = set()
        await self.mark_online()
        await self.accept()

        # Auto-join all chat groups this user belongs to
        chat_ids = await self.get_user_chat_ids()
        for chat_id in chat_ids:
            group_name = chat_group(chat_id)
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.joined_chats.add(str(chat_id))
        logger.info("User %s joined %d chat groups", self.user.id, len(chat_ids))


    async def disconnect(self, close_code: int | None):
        for chat_id in list(self.joined_chats):
            await self.channel_layer.group_discard(chat_group(chat_id), self.channel_name)
        await self.mark_offline()
        await self.close(code=1000)

    async def receive_json(self, content: dict[str, Any]):
        msg_type = content.get("type")
        logger.info("WS received: type=%s content=%s", msg_type, content)

        # if msg_type == WSEvent.CHAT_JOIN:
        #     await self.handle_join(content["chat_id"])

        # elif msg_type == WSEvent.CHAT_LEAVE:
        #     await self.handle_leave(content["chat_id"])

        # elif msg_type == WSEvent.CHAT_MESSAGE:
        #     await self.handle_message(content["chat_id"], content["content"])
        
    # async def handle_join(self, chat_id: str):
    #     is_member = await self.user_in_room(chat_id)
        
    #     if not is_member:
    #         await self.send_json({"type": WSEvent.ERROR, "detail": "Not a member of this room"})
    #         return
    #     await self.channel_layer.group_add(chat_group(chat_id), self.channel_name)
    #     self.joined_chats.add(chat_id)

    # async def handle_leave(self, chat_id: str):
    #     await self.channel_layer.group_discard(chat_group(chat_id), self.channel_name)
    #     self.joined_chats.discard(chat_id)

    # async def handle_message(self, chat_id: str, content: str):
    #     if chat_id not in self.joined_chats:
    #         await self.send_json({"type": WSEvent.ERROR, "detail": "Not a member of this room"})
    #         return
        
    #     message = await self.save_message(chat_id, content)
        
    #     await self.channel_layer.group_send(
    #         chat_group(chat_id),
    #         {
    #             "type": "chat.message",
    #             "data": {
    #                 "id": str(message.id),
    #                 "chat_id": str(chat_id),
    #                 "sender_id": str(self.user.id),
    #                 "content": message.content,
    #                 "created_at": message.created_at.isoformat(),
    #             },
    #         },
    #     )
        
    # Group event handler — pushes to this specific client -> type: "chat_message"
    async def chat_message(self, event):
        await self.send_json({"type": WSEvent.CHAT_MESSAGE, "data": event["data"]})


    @database_sync_to_async
    def user_in_room(self, room_id: str):
        return Chat.objects.filter(id=room_id, participants=self.user).exists()

    @database_sync_to_async
    def mark_online(self):
        from apps.accounts.models.enums import UserStatus
        self.user.status = UserStatus.ONLINE
        self.user.save()

    @database_sync_to_async
    def mark_offline(self):
        from apps.accounts.models.enums import UserStatus
        self.user.status = UserStatus.AWAY
        self.user.last_active = timezone.now()
        self.user.save()

    @database_sync_to_async
    def save_message(self, room_id: str, content: str):
        return Message.objects.create(
            room_id=room_id,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def get_user_chat_ids(self):
        return list(
            Chat.objects.filter(
                participants__user=self.user
            ).values_list("id", flat=True)
        )