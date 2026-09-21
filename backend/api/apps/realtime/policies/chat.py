"""Chat policy helpers — access-control for chats + who can start DMs with whom."""
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


# ------------------------------------------------------------------ #
# Message-request gate (for brand-new DMs)
# ------------------------------------------------------------------ #
class MessageGateResult:
    """Routing decision for a new DM start."""

    __slots__ = ("allowed", "requires_request", "blocked", "reason")

    def __init__(self, allowed: bool, requires_request: bool, blocked: bool, reason: str) -> None:
        self.allowed = allowed
        self.requires_request = requires_request
        self.blocked = blocked
        self.reason = reason

    def __bool__(self) -> bool:
        return not self.blocked


def _follows(a_id, b_id) -> bool:
    return Follow.objects.filter(follower_id=a_id, following_id=b_id, status="accepted").exists()


def evaluate_message_gate(from_user, to_user) -> MessageGateResult:
    """Decide how to route a brand-new DM from ``from_user`` to ``to_user``.

    - ``allowed``        → auto-accept (mutual follow); recipient gets a
                           JOINED participant row immediately.
    - ``requires_request`` → a pending MessageRequest is created; recipient
                             does NOT become a participant until they accept.
    - ``blocked``        → raise PermissionDenied to the caller.
    """
    if from_user.id == to_user.id:
        return MessageGateResult(False, False, True, "Cannot message yourself.")

    # Existing block relationship wins.
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


# ------------------------------------------------------------------ #
# Per-chat access policy (view / send / history)
# ------------------------------------------------------------------ #
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

    # -- View / send ---------------------------------------------------- #
    def can_view(self) -> bool:
        """User is a JOINED/LEFT participant (i.e. the chat exists in their
        history). BLOCKED/REMOVED rows still exist but are not viewable."""
        if self.user is None or not self.user.is_authenticated or self.chat is None:
            return False
        if self._me is None:
            return False
        return self._me.status in (ChatParticipant.Status.JOINED, ChatParticipant.Status.LEFT)

    def can_view_history(self) -> bool:
        return self.can_view()

    def can_send_message(self) -> bool:
        if not self.can_view():
            return False
        if self.chat is None:
            return False
        # For groups/clubs any JOINED member can send.
        if self.chat.type in (ChatType.GROUP, ChatType.CLUB):
            return self._me is not None and self._me.status == ChatParticipant.Status.JOINED
        # For DMs both sides must be JOINED (chat is bidirectionally accepted).
        active = [p for p in self.chat.participants.all() if p.status == ChatParticipant.Status.JOINED]
        return len(active) == 2

    def can_start_dm_with(self, other: "User") -> bool:
        """Used before start_direct; permission is delegated to evaluate_message_gate."""
        if self.user is None or other is None:
            return False
        return not evaluate_message_gate(self.user, other).blocked

    # -- Admin / management -------------------------------------------- #
    def can_edit_chat(self) -> bool:
        return self._me is not None and (self._me.is_admin or self._me.is_owner)

    def can_add_members(self) -> bool:
        return self.chat is not None and self.chat.type != ChatType.DIRECT and self.can_edit_chat()
