"""Repository for :class:`~apps.realtime.models.chat.MessageReaction`."""
from __future__ import annotations

import uuid
from typing import Optional

from core.repositories import BaseRepository

from ..models.chat.reaction import MessageReaction


class MessageReactionRepository(BaseRepository[MessageReaction]):
    model = MessageReaction

    def toggle(
        self, *, message_id: uuid.UUID, user_id: uuid.UUID, emoji: str
    ) -> tuple[MessageReaction, bool]:
        """Add or remove a reaction. Returns (obj, created).

        * If the reaction already existed for (message, user, emoji), delete
          it and return ``(None, False)``-alike.
        * Otherwise create it and return ``(obj, True)``.
        """
        existing = self.get_or_none(message_id=message_id, user_id=user_id, emoji=emoji)
        if existing is not None:
            existing.delete()
            return existing, False
        return (
            self.create(message_id=message_id, user_id=user_id, emoji=emoji),
            True,
        )

    def for_message(self, message_id: uuid.UUID):
        return self.get_queryset().filter(message_id=message_id).select_related("user")
