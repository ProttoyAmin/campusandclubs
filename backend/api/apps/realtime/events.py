"""WS event constants, Channels dispatch types, and group-name helpers.

Two naming spaces live here:

* ``WSEvent.*``     — public event names sent over the wire to clients
                      (e.g. ``"chat:message:new"``). These are namespaced
                      with colons.
* ``ChannelsEvent.*`` — internal ``group_send`` routing keys. Channels
                      maps ``'.'`` to ``'_'`` when dispatching to consumer
                      methods, so these are dot-separated and mirror the
                      consumer's method names exactly. They are never sent
                      verbatim to the frontend.

Add new events here only — never scatter raw strings in consumers,
handlers, or services.
"""
from __future__ import annotations

import uuid


# Group name prefixes (centralized to avoid typos)
CHAT_GROUP_PREFIX = "chat_"
NOTIFICATION_GROUP_PREFIX = "notifications_"
USER_GROUP_PREFIX = "user_"


class WSEvent:
    """Public wire event names (client <-> server)."""

    # Chat room lifecycle
    CHAT_JOIN = "chat:join"
    CHAT_LEAVE = "chat:leave"
    CHAT_UPDATED = "chat:updated"

    # Messages
    CHAT_MESSAGE = "chat:message:new"
    CHAT_MESSAGE_EDIT = "chat:message:updated"
    CHAT_MESSAGE_DELETE = "chat:message:deleted"
    CHAT_MESSAGE_DELIVERED = "chat:message:delivered"
    CHAT_MESSAGE_SEEN = "chat:message:seen"
    CHAT_MESSAGE_REACTION_ADD = "chat:reaction:added"
    CHAT_MESSAGE_REACTION_REMOVE = "chat:reaction:removed"

    # Typing
    CHAT_TYPING = "chat:typing"

    # Request lifecycle
    CHAT_REQUEST_NEW = "chat:request:new"
    CHAT_REQUEST_ACCEPTED = "chat:request:accepted"
    CHAT_REQUEST_DECLINED = "chat:request:declined"

    # Personal notifications (presence, new chat when backgrounded)
    NOTIFICATION = "notification:message"
    PRESENCE_UPDATE = "presence:update"

    # Protocol
    ERROR = "error"
    ACK = "ack"


class ChannelsEvent:
    """Internal group_send ``type`` values — dot separated so Channels can
    dispatch them to ``consumer.<method_name>`` handlers."""

    CHAT_MESSAGE = "chat.message.new"
    CHAT_MESSAGE_EDIT = "chat.message.updated"
    CHAT_MESSAGE_DELETE = "chat.message.deleted"
    CHAT_MESSAGE_DELIVERED = "chat.message.delivered"
    CHAT_MESSAGE_SEEN = "chat.message.seen"
    CHAT_MESSAGE_REACTION_ADD = "chat.reaction.added"
    CHAT_MESSAGE_REACTION_REMOVE = "chat.reaction.removed"
    CHAT_TYPING = "chat.typing"
    CHAT_UPDATED = "chat.updated"
    CHAT_REQUEST_NEW = "chat.request.new"
    CHAT_REQUEST_ACCEPTED = "chat.request.accepted"
    CHAT_REQUEST_DECLINED = "chat.request.declined"
    NOTIFICATION = "notification.message"
    PRESENCE_UPDATE = "presence.update"


def chat_group(chat_id: uuid.UUID) -> str:
    """Channel group for everyone currently viewing a chat room."""
    return f"{CHAT_GROUP_PREFIX}{chat_id}"


def notification_group(user_id: uuid.UUID) -> str:
    """Per-user personal channel (used for new-message pushes when the
    client isn't actively viewing a chat, plus request notifications)."""
    return f"{NOTIFICATION_GROUP_PREFIX}{user_id}"
