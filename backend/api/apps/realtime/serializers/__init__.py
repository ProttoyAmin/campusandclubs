from .chat.chat_serializers import (
    ChatSerializer,
    ChatStartSerializer,
    GroupChatCreateSerializer,
    # MessageAttachmentSerializer,
    MessageCreateSerializer,
    MessageDeleteSerializer,
    MessageEditSerializer,
    MessageReactionSerializer,
    MessageRequestSerializer,
    MessageSerializer,
    MessageUploadSerializer,
    ReactionCreateSerializer,
    ReceiptSerializer,
)
from .chat.dm_serializers import ChatCreateSerializer

# Legacy alias — older code imports ``MessageSendSerializer``.
MessageSendSerializer = MessageCreateSerializer

__all__ = [
    "ChatCreateSerializer",
    "ChatSerializer",
    "ChatStartSerializer",
    "GroupChatCreateSerializer",
    # "MessageAttachmentSerializer",
    "MessageCreateSerializer",
    "MessageDeleteSerializer",
    "MessageEditSerializer",
    "MessageReactionSerializer",
    "MessageRequestSerializer",
    "MessageSendSerializer",
    "MessageSerializer",
    "MessageUploadSerializer",
    "ReactionCreateSerializer",
    "ReceiptSerializer",
]
