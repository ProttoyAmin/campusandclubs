"""DTOs for messages, receipts, reactions, and message-history queries."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Optional, Sequence

from ..models.chat.message import MessageType


@dataclass
class MessageAttachmentDTO:
    """A single media attachment — mirrors ``MessageAttachment`` fields."""

    file_url: str
    kind: str = "file"
    thumb_url: Optional[str] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_ms: Optional[int] = None


@dataclass
class MessageSendDTO:
    """Input DTO for sending a message."""

    content: str
    reply_to: Optional[uuid.UUID] = None
    msg_type: str = MessageType.TEXT
    client_msg_id: Optional[uuid.UUID] = None
    attachments: Sequence[MessageAttachmentDTO] = field(default_factory=list)


@dataclass
class MessageEditDTO:
    content: str


@dataclass
class ReactionDTO:
    """Toggle a reaction on a message."""

    message_id: uuid.UUID
    emoji: str


@dataclass
class MessageListQueryDTO:
    """Inputs for the paginated message-history endpoint."""

    chat_id: uuid.UUID
    cursor: Optional[uuid.UUID] = None   # message id to page from
    before: bool = True                  # load older (True) or newer (False)
    limit: int = 50


@dataclass
class ReceiptDTO:
    """Mark messages in a chat up to ``message_id`` as seen/delivered."""

    chat_id: uuid.UUID
    message_id: uuid.UUID
    status: str = "seen"
