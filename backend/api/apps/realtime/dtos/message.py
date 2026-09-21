"""DTOs for messages, receipts, reactions, and message-history queries."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Optional, Sequence, Any

from ..models.chat.message import MessageType


@dataclass
class MessageAttachmentDTO:
    """Lightweight reference to an attachment that has already been
    persisted (either a Cloudinary URL or a Media-row id)."""

    file_url: str
    kind: str = "file"
    thumb_url: Optional[str] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    duration_ms: Optional[int] = None
    media_id: Optional[uuid.UUID] = None


@dataclass
class MessageSendDTO:
    """Input DTO for sending a message.

    ``attachments`` is a list of :class:`MessageAttachmentDTO` objects —
    i.e. already-persisted references (used when the client uploads via
    ``/media/`` first). ``files`` carries raw uploaded files from a
    multipart request; the service will persist them through
    :class:`MediaRepository` and attach them to the new message.
    """

    content: str
    reply_to: Optional[uuid.UUID] = None
    msg_type: str = MessageType.TEXT
    client_msg_id: Optional[uuid.UUID] = None
    attachments: Sequence[MessageAttachmentDTO] = field(default_factory=list)
    files: Sequence[Any] = field(default_factory=list)  # UploadedFile objects (from multipart)


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
    cursor: Optional[uuid.UUID] = None
    before: bool = True
    limit: int = 50


@dataclass
class ReceiptDTO:
    chat_id: uuid.UUID
    message_id: uuid.UUID
    status: str = "seen"
