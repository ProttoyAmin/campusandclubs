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


class MessageGateResult:
    """Routing decision for a new DM start.

    auto_accept   → both participants are added ACCEPTED (mutual follow etc.).
    requires_request → recipient is added PENDING; message is saved but lands
                   in their requests inbox.
    blocked       → raise PermissionDenied.
    """

    __slots__ = ("auto_accept", "requires_request", "blocked", "reason")

    def __init__(self, auto_accept: bool, requires_request: bool, blocked: bool, reason: str) -> None:
        self.auto_accept = auto_accept
        self.requires_request = requires_request
        self.blocked = blocked
        self.reason = reason

    def __bool__(self) -> bool:
        return not self.blocked


def _follows(a_id, b_id) -> bool:
    return Follow.objects.filter(follower_id=a_id, following_id=b_id, status="accepted").exists()


def evaluate_message_gate(from_user, to_user) -> MessageGateResult:
    """Decide how to route a brand-new DM from ``from_user`` to ``to_user``."""
    if from_user.id == to_user.id:
        return MessageGateResult(False, False, True, "Cannot message yourself.")

    if Block.has_blocked_each_other(from_user, to_user):
        return MessageGateResult(False, False, True, "Blocked users cannot message each other.")

    try:
        pref = to_user.preferences
        choice = pref.message_request_choice
    except UserModel.preferences.RelatedObjectDoesNotExist:
        from apps.accounts.models.user_preference import UserPreference
        pref = UserPreference.objects.create(user=to_user)
        choice = pref.message_request_choice

    sender_follows_recipient = _follows(from_user.id, to_user.id)
    recipient_follows_sender = _follows(to_user.id, from_user.id)
    mutual = sender_follows_recipient and recipient_follows_sender

    if choice == MessageRequestChoice.NONE:
        return MessageGateResult(False, False, True, "This user does not accept new messages.")

    if mutual:
        return MessageGateResult(True, False, False, "Mutual follow — auto-accepted.")

    if choice == MessageRequestChoice.MUTUAL:
        return MessageGateResult(
            False, False, True,
            "This user only accepts messages from people they follow back.",
        )

    if choice == MessageRequestChoice.FOLLOWERS and not sender_follows_recipient:
        return MessageGateResult(
            False, False, True,
            "This user only accepts messages from their followers.",
        )

    return MessageGateResult(False, True, False, "Message queued as a request.")


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

    def can_view(self) -> bool:
        """True if the chat is visible to the user in either the main inbox
        or the requests inbox. Hidden when DECLINED/LEFT/REMOVED/BLOCKED."""
        if self.user is None or not self.user.is_authenticated or self.chat is None:
            return False
        if self._me is None:
            return False
        return self._me.status in (
            ChatParticipant.Status.ACCEPTED,
            ChatParticipant.Status.PENDING,
        )

    def can_view_history(self) -> bool:
        # LEFT users can still see their history in an "archived" view if
        # we ever build one; for now treat it the same as can_view.
        if self._me is None:
            return False
        return self._me.status in (
            ChatParticipant.Status.ACCEPTED,
            ChatParticipant.Status.PENDING,
            ChatParticipant.Status.LEFT,
        )

    def can_send_message(self) -> bool:
        """Only ACCEPTED members can send. PENDING recipients can't reply
        until they accept; DECLINED/LEFT/REMOVED/BLOCKED can't send."""
        if not self.can_view():
            return False
        if self.chat is None or self._me is None:
            return False
        return self._me.status == ChatParticipant.Status.ACCEPTED

    def can_leave(self) -> bool:
        return self._me is not None and self._me.status == ChatParticipant.Status.ACCEPTED

    def can_remove_member(self, other_p: ChatParticipant) -> bool:
        """Owner/admin can REMOVE other ACCEPTED members; cannot remove
        the owner. Caller is ``self._me``."""
        if self._me is None:
            return False
        if self.chat is None or self.chat.type == ChatType.DIRECT:
            return False
        if not (self._me.is_admin or self._me.is_owner):
            return False
        if other_p.is_owner:
            return False
        return other_p.status == ChatParticipant.Status.ACCEPTED

    def can_block(self) -> bool:
        """Only valid on DMs. User can block only if there is any
        existing participant row (i.e. an open or pending conversation)."""
        if self.chat is None or self.chat.type != ChatType.DIRECT:
            return False
        return self._me is not None and self._me.status != ChatParticipant.Status.BLOCKED

    def can_start_dm_with(self, other: "User") -> bool:
        if self.user is None or other is None:
            return False
        return not evaluate_message_gate(self.user, other).blocked

    def can_edit_chat(self) -> bool:
        return self._me is not None and (self._me.is_admin or self._me.is_owner)

    def can_add_members(self) -> bool:
        return self.chat is not None and self.chat.type != ChatType.DIRECT and self.can_edit_chat()
