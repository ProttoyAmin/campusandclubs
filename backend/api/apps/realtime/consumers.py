from typing import Any
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, ChatRoom


class AppSocketConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.joined_rooms = set()
        await self.accept()


    async def disconnect(self, close_code: int | None):
        for room_id in list(self.joined_rooms):
            await self.channel_layer.group_discard(f"chat_{room_id}", self.channel_name)

    async def receive_json(self, content: dict[str, Any]):
        msg_type = content.get("type")

        if msg_type == "chat_join":
            await self.handle_join(content["room_id"])

        elif msg_type == "chat_leave":
            await self.handle_leave(content["room_id"])

        elif msg_type == "chat_message":
            await self.handle_message(content["room_id"], content["content"])
        
    async def handle_join(self, room_id: str):
        is_member = await self.user_in_room(room_id)
        
        if not is_member:
            await self.send_json({"type": "error", "detail": "Not a member of this room"})
            return
        await self.channel_layer.group_add(f"chat_{room_id}", self.channel_name)
        self.joined_rooms.add(room_id)

    async def handle_leave(self, room_id: str):
        await self.channel_layer.group_discard(f"chat_{room_id}", self.channel_name)
        self.joined_rooms.discard(room_id)

    async def handle_message(self, room_id: str, content: str):
        if room_id not in self.joined_rooms:
            await self.send_json({"type": "error", "detail": "Not a member of this room"})
            return
        
        message = await self.save_message(room_id, content)
        
        await self.channel_layer.group_send(
            f"chat_{room_id}",
            {
                "type": "chat_message",
                "data": {
                    "id": str(message.id),
                    "room_id": str(room_id),
                    "sender_id": str(self.user.id),
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                },
            },
        )
        
    # Group event handler — pushes to this specific client -> type: "chat_message"
    async def chat_message(self, event):
        await self.send_json({"type": "chat_message", "data": event["data"]})


    @database_sync_to_async
    def user_in_room(self, room_id: str):
        return ChatRoom.objects.filter(id=room_id, participants=self.user).exists()

    @database_sync_to_async
    def save_message(self, room_id: str, content: str):
        return ChatMessage.objects.create(
            room_id=room_id,
            sender=self.user,
            content=content
        )