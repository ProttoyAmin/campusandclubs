"""Chat policy helpers — access-control for chats + who can start DMs with whom.

The chat-participant row is the single source of truth for membership state:
    ACCEPTED → chat appears in the main inbox; messages flow normally.
    PENDING  → chat appears in the recipient's "message requests" inbox;
               the sender still sees their messages, but the recipient
               has not accepted yet. Notifications to the recipient are
               suppressed until they accept.
    DECLINED → hidden; no further messages can be sent until re-opened.
"""
from __future__ import annotations

from typing import TYPE_CHECKING, Optional

from django.contrib.auth import get_user_model

from ..models.chat.enums import ChatType
from ..models.chat.participants import ChatParticipant
from apps.accounts.models.enums import MessageRequestChoice
from apps.connections.models import Block, Follow

if TYPE_CHECKING:
    from ..models.chat.chat import Chat
    from django.contrib.auth.models import AbstractUser as User

UserModel = get_user_model()



class ChatPolicy:
    """Access checks against an existing ``Chat`` instance."""

    def __init__(self, user: Optional["User"], chat: Optional["Chat"]) -> None:
        self.user = user
        self.chat = chat
        self._me: Optional[ChatParticipant] = None
        if chat is not None and user is not None and user.is_authenticated:
            self._me = next(
                (p for p in chat.participants.all() if p.user_id == user.id),
                None,
            )

    def can_leave(self) -> bool:
        return self._me is not None and self._me.status == ChatParticipant.Status.ACCEPTED
