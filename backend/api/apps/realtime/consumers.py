"""``AppSocketConsumer`` — single per-user WebSocket connection.

Design (see ``architecture.md``):

* One persistent WS per authenticated user multiplexes chat, notifications,
  and presence events.
* Chat groups are joined/left **explicitly** as the user navigates between
  rooms (``chat:join`` / ``chat:leave``). We do NOT auto-join every chat
  the user is a member of — that scales poorly and wastes bandwidth on
  rooms they aren't looking at.
* On connect we only join the user's personal notification channel (so
  new-message pings and message-request notifications arrive even when
  they're not in a chat view).
* The consumer itself is a thin dispatcher: it routes inbound messages
  via ``INBOUND_HANDLERS`` and exposes small outbound methods for each
  ``ChannelsEvent.*`` (Channels maps ``.`` → ``_`` for dispatch).

Auth note
---------
``AuthMiddlewareStack`` provides ``scope["user"]`` from Django sessions.
If a client authenticates using the HttpOnly JWT cookie instead, a
JWT-aware middleware (see ``apps.accounts.config.authentication``) should
be added to the ASGI stack; until then the existing session auth path
continues to work and the consumer gracefully closes unauthenticated
connections.
"""
from __future__ import annotations

import json
import logging
from typing import Any
import uuid

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from apps.accounts.models import User
from apps.accounts.models.enums import UserStatus
from apps.realtime.events import (
    CHAT_GROUP_PREFIX,
    NOTIFICATION_GROUP_PREFIX,
    WSEvent,
    ChannelsEvent,
    notification_group,
)
from apps.realtime.handlers import INBOUND_HANDLERS

logger = logging.getLogger(__name__)


class AppSocketConsumer(AsyncJsonWebsocketConsumer):
    # ----------------------------------------------------------------- #
    # Lifecycle
    # ----------------------------------------------------------------- #
    async def connect(self) -> None:
        self.user: User = self.scope.get("user")  # type: ignore[assignment]
        if not self.user or not getattr(self.user, "is_authenticated", False):
            await self.close()
            return

        self.joined_chats: set[str] = set()
        self.user_group: str | None = None

        await self.accept()
        await self._mark_online()

        # Join the personal notification channel.
        self.user_group = notification_group(self.user.id)
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        logger.info("WS connected user=%s", self.user.id)

    async def disconnect(self, close_code: int | None) -> None:
        for chat_id in list(self.joined_chats):
            await self.channel_layer.group_discard(
                f"{CHAT_GROUP_PREFIX}{chat_id}", self.channel_name
            )
        if self.user_group:
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self._mark_offline()
        logger.info("WS disconnected user=%s code=%s", getattr(self.user, "id", None), close_code)

    # ----------------------------------------------------------------- #
    # Inbound dispatch
    # ----------------------------------------------------------------- #
    async def receive_json(self, content: dict[str, Any]) -> None:
        msg_type = content.get("type")
        logger.debug("WS recv user=%s type=%s", getattr(self.user, "id", None), msg_type)
        handler = INBOUND_HANDLERS.get(msg_type)
        if handler is None:
            # Unknown event type — ignore rather than disconnect, but log
            # so we can spot typos/missing handlers.
            logger.info("WS received unknown event type: %s", msg_type)
            return
        try:
            await handler(self, content)
        except Exception:
            logger.exception("WS handler %s raised", msg_type)
            await self.send_json(
                {"type": WSEvent.ERROR, "detail": f"Failed to handle {msg_type}"}
            )

    # ----------------------------------------------------------------- #
    # Outbound handlers — one per ChannelsEvent.* value
    # ----------------------------------------------------------------- #
    async def chat_message_new(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE, "data": event["data"]})

    async def chat_message_updated(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_EDIT, "data": event["data"]})

    async def chat_message_deleted(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_DELETE, "data": event["data"]})

    async def chat_message_delivered(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_DELIVERED, "data": event["data"]})

    async def chat_message_seen(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_SEEN, "data": event["data"]})

    async def chat_reaction_added(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_REACTION_ADD, "data": event["data"]})

    async def chat_reaction_removed(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_MESSAGE_REACTION_REMOVE, "data": event["data"]})

    async def chat_typing(self, event: dict) -> None:
        # Don't echo typing back to the sender.
        data = event["data"]
        if str(data.get("user_id")) == str(self.user.id):
            return
        await self.send_json({"type": WSEvent.CHAT_TYPING, "data": data})

    async def chat_updated(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_UPDATED, "data": event["data"]})

    async def chat_request_new(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_REQUEST_NEW, "data": event["data"]})

    async def chat_request_accepted(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_REQUEST_ACCEPTED, "data": event["data"]})

    async def chat_request_declined(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.CHAT_REQUEST_DECLINED, "data": event["data"]})

    async def notification_message(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.NOTIFICATION, "data": event["data"]})

    async def presence_update(self, event: dict) -> None:
        await self.send_json({"type": WSEvent.PRESENCE_UPDATE, "data": event["data"]})

    # ----------------------------------------------------------------- #
    # Presence helpers
    # ----------------------------------------------------------------- #
    @database_sync_to_async
    def _mark_online(self) -> None:
        self.user.status = UserStatus.ONLINE
        self.user.save(update_fields=["status"])

    @database_sync_to_async
    def _mark_offline(self) -> None:
        self.user.status = UserStatus.AWAY
        self.user.last_active = timezone.now()
        self.user.save(update_fields=["status", "last_active"])
