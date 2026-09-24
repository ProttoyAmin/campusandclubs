from __future__ import annotations
import uuid
from dataclasses import dataclass

@dataclass
class ChatCreateDTO:
    """Start a one-to-one chat with another user.

    If a non-declined DM already exists between the actor and
    ``participant_id`` the service will return it instead of creating a new
    one; this makes the endpoint idempotent.
    """

    participant_id: uuid.UUID

@dataclass
class ChatActionDTO:
    """Generic accept/decline/mark-read action against a chat."""

    chat_id: uuid.UUID
