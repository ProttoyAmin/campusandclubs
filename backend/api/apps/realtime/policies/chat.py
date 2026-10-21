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
from apps.accounts.models import UserPreference

from typing import TYPE_CHECKING, Optional

from django.contrib.auth import get_user_model

from ..models.chat.enums import ChatType
from ..models.chat.participants import ChatParticipant
from apps.accounts.models.enums import MessageRequestChoice
from apps.connections.models import Block, Follow
from core.policies.base import Policy
from apps.accounts.models import User
from ..models.chat.chat import Chat

# if TYPE_CHECKING:
#     from ..models.chat.chat import Chat
#     from django.contrib.auth.models import AbstractUser as User

UserModel = get_user_model()



class ChatPolicy(Policy[User, Optional[Chat]]):
    """Access checks against an existing or potential ``Chat`` instance."""

    def __init__(self, actor: Optional[User], record: Optional[Chat] = None) -> None:
        super().__init__(actor, record)
        self.user = self.actor
        self.chat = self.record

    @property
    def _me(self) -> Optional[ChatParticipant]:
        if self.chat is None or self.actor is None or not getattr(self.actor, "is_authenticated", False):
            return None
        if hasattr(self.chat, "_prefetched_objects_cache") and "participants" in self.chat._prefetched_objects_cache:
            return next((p for p in self.chat.participants.all() if p.user_id == self.actor.id), None)
        if hasattr(self.chat, "participants"):
            return self.chat.participants.filter(user_id=self.actor.id).first()
        return None

    def can_view(self) -> bool:
        """True if the chat is visible to the user in either the main inbox
        or the requests inbox. Hidden when DECLINED/LEFT/REMOVED/BLOCKED."""
        if self.actor is None or not getattr(self.actor, "is_authenticated", False) or self.record is None:
            return False
        if self._me is None:
            return False
        return self._me.status in (
            ChatParticipant.Status.ACCEPTED,
            ChatParticipant.Status.PENDING,
        )

    def can_start_dm(self, target: Optional[User] = None) -> bool:
        """True if direct messages sent to ``target`` are accepted immediately.
        False if they should land in pending message requests or cannot be sent."""
        if self.actor is None or not getattr(self.actor, "is_authenticated", False):
            return False

        if target is None:
            if isinstance(self.record, User):
                target = self.record
            elif self.record is not None and hasattr(self.record, "participants"):
                target_p = next(
                    (p for p in self.record.participants.all() if p.user_id != self.actor.id),
                    None,
                )
                if target_p is not None:
                    target = target_p.user

        if target is None:
            return False

        if self.actor.id == target.id:
            return False

        if Block.has_blocked_each_other(self.actor, target):
            return False

        try:
            preference = target.preferences
        except (UserPreference.DoesNotExist, AttributeError):
            preference = None

        choice = preference.message_request_choice if preference else MessageRequestChoice.EVERYONE

        if choice == MessageRequestChoice.EVERYONE:
            return True

        if choice == MessageRequestChoice.FOLLOWERS:
            return Follow.is_following(follower=self.actor, following=target)

        if choice == MessageRequestChoice.MUTUAL:
            return Follow.are_mutual_followers(self.actor, target)

        if choice == MessageRequestChoice.NONE:
            return False

        return False

    def can_send_message(self) -> bool:
        """Only ACCEPTED members can send. PENDING recipients can't reply
        until they accept; DECLINED/LEFT/REMOVED/BLOCKED can't send."""
        if not self.can_view():
            return False
        if self.record is None or self._me is None:
            return False
        return self._me.status == ChatParticipant.Status.ACCEPTED

    def can_leave(self) -> bool:
        return self._me is not None and self._me.status == ChatParticipant.Status.ACCEPTED

    def can_block(self) -> bool:
        """Only valid on DMs. User can block only if there is any
        existing participant row (i.e. an open or pending conversation)."""
        if self.chat is None:
            return False
        if self.chat.type != ChatType.DIRECT:
            return False
            
        return self._me is not None and self._me.status != ChatParticipant.Status.BLOCKED
