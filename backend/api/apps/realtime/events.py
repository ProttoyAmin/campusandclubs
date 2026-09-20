# events.py
import uuid

class WSEvent:
    """Outbound message types (server -> client) and inbound
    dispatch keys (client -> server) that flow over the socket."""

    # Chat
    CHAT_JOIN = "chat:join"
    CHAT_LEAVE = "chat:leave"
    CHAT_MESSAGE = "chat:message"
    CHAT_MESSAGE_EDIT = "chat:message:edit"
    CHAT_MESSAGE_DELETE = "chat:message:delete"
    CHAT_MESSAGE_SEEN = "chat:message:seen"

    # Feed
    FEED_SUBSCRIBE = "feed:subscribe"
    FEED_UNSUBSCRIBE = "feed:unsubscribe"
    FEED_UPDATE = "feed:update"

    # Notifications
    NOTIFICATION = "notification:message"

    # Presence
    PRESENCE_UPDATE = "presence:update"

    # Protocol-level
    ERROR = "error"


class ChannelsHandler:
    """Internal group_send routing keys — must be dot-separated to match
    a consumer method name (Channels replaces '.' with '_' for dispatch).
    Never sent to the frontend directly; the matching consumer method
    translates each one into its WSEvent counterpart in send_json."""

    CHAT_MESSAGE = "chat.message"


def chat_group(chat_id: uuid.UUID) -> str:
    return f"chat_{chat_id}"

def feed_group(topic: str) -> str:
    return f"feed_{topic}"

def notification_group(user_id: uuid.UUID) -> str:
    return f"notifications_{user_id}"