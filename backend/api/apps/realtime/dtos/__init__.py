"""Data Transfer Objects for the realtime app.

DTOs are simple typed containers used to carry validated data from
serializers → services. They keep service signatures explicit and make
unit testing straightforward (no need to construct ``ValidatedData``
mocks, just instantiate a dataclass).
"""
from .chat import (
    ChatCreateDTO,
    ChatStartDTO,
    GroupChatCreateDTO,
    ChatActionDTO,
)
from .message import (
    MessageSendDTO,
    MessageEditDTO,
    MessageAttachmentDTO,
    ReactionDTO,
    MessageListQueryDTO,
    ReceiptDTO,
)

__all__ = [
    "ChatActionDTO",
    "ChatCreateDTO",
    "ChatStartDTO",
    "GroupChatCreateDTO",
    "MessageAttachmentDTO",
    "MessageEditDTO",
    "MessageListQueryDTO",
    "MessageSendDTO",
    "ReactionDTO",
    "ReceiptDTO",
]
