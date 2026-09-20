"""DTOs for chat-room creation and participant actions."""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ChatCreateDTO:
    """Start a one-to-one chat with another user.

    If a non-declined DM already exists between the actor and
    ``participant_id`` the service will return it instead of creating a new
    one; this makes the endpoint idempotent.
    """

    participant_id: uuid.UUID


@dataclass
class ChatStartDTO:
    """Get-or-create a DM or small group and immediately send a first message.

    Mirrors the existing ``ChatStartSerializer`` shape so the React/Angular
    clients can keep calling the same endpoint.
    """

    participant_ids: list[uuid.UUID]
    content: str
    name: Optional[str] = None
    client_msg_id: Optional[uuid.UUID] = None


@dataclass
class GroupChatCreateDTO:
    """Create a named group chat. The actor is always an owner/admin."""

    name: str
    participant_ids: list[uuid.UUID]
    description: Optional[str] = None


@dataclass
class ChatActionDTO:
    """Generic accept/decline/mark-read action against a chat."""

    chat_id: uuid.UUID
