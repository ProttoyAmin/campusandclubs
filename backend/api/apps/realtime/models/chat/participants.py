"""ChatParticipant — the junction table linking users to chats."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from .chat import Chat


class ChatParticipant(models.Model):
    """A user's membership in a chat.

    ``status`` controls whether the chat should appear in the user's main
    chat list or in the "message requests" bucket.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"     # DM sent, recipient has not accepted
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_participations",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACCEPTED,
    )
    is_admin = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False)

    # Conversation-level watermark. Updated when the user opens the chat and
    # their scroll reaches the latest message.
    last_read_at = models.DateTimeField(null=True, blank=True)

    is_muted = models.BooleanField(default=False)
    muted_until = models.DateTimeField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("chat", "user")
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["chat", "status"]),
            models.Index(fields=["user", "is_pinned", "-joined_at"]),
        ]
