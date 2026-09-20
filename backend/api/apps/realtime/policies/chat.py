"""Authorization rules for chat rooms."""
from __future__ import annotations

from typing import Optional

from django.db.models import Model

from apps.accounts.models import User
from apps.connections.models import Block
from core.policies.base import Policy

from ..models.chat.chat import Chat
from ..models.chat.enums import ChatType
from ..models.chat.participants import ChatParticipant


class ChatPolicy(Policy[User, Optional[Chat]]):
    """Authorizes actions against a :class:`Chat` instance.

    The pattern follows ``apps.accounts.policies.user.UserPolicy``: the
    ``actor`` is the current user and ``record`` is the chat in question.
    """

    # ------------------------------------------------------------------ #
    # View-level checks
    # ------------------------------------------------------------------ #
    def can_view(self) -> bool:
        """Can the actor see this chat at all (list / fetch detail)?"""
        if self.record is None:
            return False
        return self._is_active_participant()

    def can_view_history(self) -> bool:
        """Can the actor read message history? Requires ACCEPTED membership
        (pending/declined users cannot read or send messages)."""
        if self.record is None:
            return False
        return self._is_active_participant()

    def can_send_message(self) -> bool:
        return self._is_active_participant()

    def can_add_members(self) -> bool:
        """For GROUP/CLUB: admins/owners only. For DIRECT: not allowed."""
        if self.record is None or self.record.type == ChatType.DIRECT:
            return False
        return self._is_admin()

    def can_remove_member(self, target_user_id) -> bool:
        if self.record is None:
            return False
        # Owners can remove anyone. Admins can remove non-admins.
        me = self._my_participant()
        if me is None:
            return False
        if me.is_owner:
            return True
        target = ChatParticipant.objects.filter(
            chat=self.record, user_id=target_user_id
        ).first()
        if target is None:
            return False
        if me.is_admin and not target.is_admin and not target.is_owner:
            return True
        return False

    def can_edit_chat(self) -> bool:
        """Group/club metadata edits — admins/owners only."""
        if self.record is None or self.record.type == ChatType.DIRECT:
            return False
        return self._is_admin()

    def can_start_dm_with(self, other_user: User) -> bool:
        """Is the actor allowed to open a DM with ``other_user``?"""
        if other_user == self.actor:
            return False
        # Blocked users cannot start conversations.
        if Block.has_blocked_each_other(self.actor, other_user):
            return False
        return True

    def can_delete_for_everyone(self, message) -> bool:
        """Forwarded to MessagePolicy for most callers; convenience here."""
        from .message import MessagePolicy
        return MessagePolicy(self.actor, message).can_delete_for_everyone()

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    def _my_participant(self) -> Optional[ChatParticipant]:
        if self.record is None:
            return None
        return ChatParticipant.objects.filter(
            chat=self.record, user=self.actor
        ).first()

    def _is_active_participant(self) -> bool:
        p = self._my_participant()
        return (
            p is not None
            and p.status == ChatParticipant.Status.ACCEPTED
            and p.left_at is None
        )

    def _is_admin(self) -> bool:
        p = self._my_participant()
        return p is not None and (p.is_admin or p.is_owner) and p.left_at is None
