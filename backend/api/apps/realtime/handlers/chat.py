"""Asynchronous WebSocket handlers for chat events.

These run on the Channels event loop, so any DB access must go through
``database_sync_to_async``. For non-trivial business logic they delegate
to the synchronous ``ChatService`` through ``sync_to_async``, which keeps
the service layer single-sourced (no duplicate async business logic).
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Callable, Coroutine

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from apps.accounts.models import User
from apps.realtime.dtos.message import MessageEditDTO, MessageSendDTO, ReceiptDTO
from apps.realtime.events import ChannelsEvent, WSEvent, chat_group
from apps.realtime.models.chat.message import MessageStatus
from apps.realtime.serializers import MessageSerializer
from apps.realtime.services.chat_service import ChatService

logger = logging.getLogger(__name__)


def _service(consumer: AsyncJsonWebsocketConsumer) -> ChatService:
    """Build a ChatService bound to this connection's user."""
    return ChatService(actor=getattr(consumer, "user", None))


# --------------------------------------------------------------------- #
# Inbound handlers (client → server)
# --------------------------------------------------------------------- #
async def handle_join(consumer: AsyncJsonWebsocketConsumer, content: dict) -> None:
    """Join a chat group (client navigated into a chat)."""
    chat_id = content.get("chat_id")
    try:
        chat_id = uuid.UUID(str(chat_id))
    except (TypeError, ValueError):
        await _error(consumer, "Invalid chat_id.")
        return

    allowed = await sync_to_async(_svc_call_can_join)(consumer, chat_id)
    if not allowed:
        await _error(consumer, "Not a member of this chat.")
        return

    await consumer.channel_layer.group_add(chat_group(chat_id), consumer.channel_name)
    consumer.joined_chats.add(str(chat_id))
    await consumer.send_json({"type": WSEvent.CHAT_JOIN, "chat_id": str(chat_id)})


async def handle_leave(consumer: AsyncJsonWebsocketConsumer, content: dict) -> None:
    """Leave a chat group (client navigated away)."""
    try:
        chat_id = uuid.UUID(str(content.get("chat_id")))
    except (TypeError, ValueError):
        return
    await consumer.channel_layer.group_discard(chat_group(chat_id), consumer.channel_name)
    consumer.joined_chats.discard(str(chat_id))


async def handle_message(consumer: AsyncJsonWebsocketConsumer, content: dict) -> None:
    """Send a message over WS. Mirrors the REST send endpoint but uses
    the same service underneath."""
    try:
        chat_id = uuid.UUID(str(content.get("chat_id")))
    except (TypeError, ValueError):
        await _error(consumer, "Invalid chat_id.")
        return

    payload = content.get("data", content)
    try:
        msg_dto = MessageSendDTO(
            content=payload.get("content", ""),
            reply_to=payload.get("reply_to"),
            msg_type=payload.get("msg_type", "TEXT"),
            client_msg_id=payload.get("client_msg_id"),
        )
    except Exception as exc:  # pragma: no cover
        await _error(consumer, f"Invalid payload: {exc}")
        return

    try:
        message = await sync_to_async(_svc_send_message)(consumer, chat_id, msg_dto)
    except Exception as exc:
        logger.warning("WS message send failed: %s", exc)
        await _error(consumer, str(exc))
        return

    # ACK back to the sender immediately so they can swap their optimistic
    # bubble for the server-id'd message.
    data = await sync_to_async(_serialize_message)(consumer, message)
    await consumer.send_json({"type": WSEvent.ACK, "data": data})


async def handle_typing(consumer: AsyncJsonWebsocketConsumer, content: dict) -> None:
    """Broadcast a typing indicator to other members of the chat. Stateless
    and transient — not persisted."""
    try:
        chat_id = uuid.UUID(str(content.get("chat_id")))
    except (TypeError, ValueError):
        return
    if str(chat_id) not in getattr(consumer, "joined_chats", set()):
        return
    is_typing = bool(content.get("is_typing", True))
    await consumer.channel_layer.group_send(
        chat_group(chat_id),
        {
            "type": ChannelsEvent.CHAT_TYPING,
            "data": {
                "chat_id": str(chat_id),
                "user_id": str(consumer.user.id),
                "is_typing": is_typing,
            },
        },
    )


async def handle_seen(consumer: AsyncJsonWebsocketConsumer, content: dict) -> None:
    try:
        chat_id = uuid.UUID(str(content.get("chat_id")))
        message_id = uuid.UUID(str(content.get("message_id")))
    except (TypeError, ValueError):
        return
    dto = ReceiptDTO(chat_id=chat_id, message_id=message_id, status="seen")
    await sync_to_async(_svc_mark_seen)(consumer, dto)


# --------------------------------------------------------------------- #
# Outbound (group-receive) handlers — translate Channels dot-types to
# WSEvent wire events.
# --------------------------------------------------------------------- #
async def push_event(consumer: AsyncJsonWebsocketConsumer, event: dict) -> None:
    """Generic pass-through for chat.* group events."""
    await consumer.send_json(event.get("payload", {"type": event.get("type"), "data": event.get("data")}))


# --------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------- #
def _svc_call_can_join(consumer, chat_id) -> bool:
    return _service(consumer).user_can_join_chat(chat_id)


def _svc_send_message(consumer, chat_id, dto):
    return _service(consumer).send_message(chat_id, dto)


def _svc_mark_seen(consumer, dto) -> None:
    _service(consumer).mark_seen(dto)


def _serialize_message(consumer, message):
    # DRF serializers need a request; fake a minimal one so user context
    # (for my_status/reactions) can still resolve.
    class _FakeRequest:
        user = consumer.user
    return MessageSerializer(message, context={"request": _FakeRequest()}).data


async def _error(consumer, detail: str) -> None:
    await consumer.send_json({"type": WSEvent.ERROR, "detail": detail})


# --------------------------------------------------------------------- #
# Routing table
# --------------------------------------------------------------------- #
INBOUND_HANDLERS: dict[str, Callable[..., Coroutine[Any, Any, None]]] = {
    WSEvent.CHAT_JOIN: handle_join,
    WSEvent.CHAT_LEAVE: handle_leave,
    WSEvent.CHAT_MESSAGE: handle_message,
    WSEvent.CHAT_TYPING: handle_typing,
    WSEvent.CHAT_MESSAGE_SEEN: handle_seen,
}

# Re-exported for clarity.
chat_handlers = INBOUND_HANDLERS
