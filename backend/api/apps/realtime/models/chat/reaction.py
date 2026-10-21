"""Message reactions (emoji responses to a message)."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from .message import Message


class MessageReaction(models.Model):
    """A single emoji reaction from one user on one message.

    The unique constraint on (message, user, emoji) means one user can react
    with multiple distinct emojis (👍 and ❤️ simultaneously) but can't stack
    duplicates of the same emoji.
    """

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_reactions",
    )
    emoji = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user", "emoji")
        indexes = [
            models.Index(fields=["message", "emoji"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"Reaction {self.emoji} by {self.user.username} on {self.message.id}"
