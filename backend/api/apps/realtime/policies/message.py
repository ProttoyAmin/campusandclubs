"""Authorization rules for individual messages."""
from __future__ import annotations

from datetime import timedelta
from typing import Optional

from django.utils import timezone

from core.policies.base import Policy

from ..models.chat.message import Message, MessageDeleteMode
from ..models.chat.participants import ChatParticipant
from apps.accounts.models import User


# Matches the existing view-level edit window; surface here so it's a rule
# rather than a magic constant in a view.
EDIT_WINDOW = timedelta(minutes=15)
DELETE_FOR_EVERYONE_WINDOW = timedelta(hours=2)


class MessagePolicy(Policy[User, Optional[Message]]):
    """Authorizes actions against a single :class:`Message`."""

    def _participant(self) -> Optional[ChatParticipant]:
        if self.record is None:
            return None
        return ChatParticipant.objects.filter(
            chat=self.record.chat, user=self.actor
        ).first()

    def _is_in_chat(self) -> bool:
        p = self._participant()
        return (
            p is not None
            and p.status == ChatParticipant.Status.JOINED
            and p.left_at is None
        )

    def can_view(self) -> bool:
        return self._is_in_chat()

    def can_edit(self) -> bool:
        if self.record is None:
            return False
        if self.record.sender_id != self.actor.id:
            return False
        if self.record.deleted_mode == MessageDeleteMode.FOR_EVERYONE:
            return False
        if timezone.now() - self.record.created_at > EDIT_WINDOW:
            return False
        return self._is_in_chat()

    def can_delete_for_me(self) -> bool:
        """Anyone in the chat may delete a message locally."""
        return self._is_in_chat()

    def can_delete_for_everyone(self) -> bool:
        """Only the sender, within a 2-hour window, can unsend for all."""
        if self.record is None:
            return False
        if self.record.sender_id != self.actor.id:
            return False
        if timezone.now() - self.record.created_at > DELETE_FOR_EVERYONE_WINDOW:
            return False
        return self._is_in_chat()

    def can_react(self) -> bool:
        return self._is_in_chat()

    def can_mark_seen(self) -> bool:
        return self._is_in_chat()
