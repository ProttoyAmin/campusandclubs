from __future__ import annotations
from django.db import models
from django.conf import settings
from .chat import Chat


class ChatParticipant(models.Model):
    """A user's active membership in a chat.

    A row in this table means: "this chat belongs in my inbox/history".
    Pending / declined state lives on ``MessageRequest`` only — a recipient
    does NOT get a ChatParticipant row until they accept the request.
    """

    class Status(models.TextChoices):
        JOINED = "joined", "Joined"
        LEFT = "left", "Left"
        BLOCKED = "blocked", "Blocked"
        REMOVED = "removed", "Removed"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_participations",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.JOINED,
    )
    is_admin = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False)

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
        verbose_name = "Chat Participant"
        verbose_name_plural = "Chat Participants"

    def __str__(self) -> str:
        return f"{self.user.username} in {self.chat_id} ({self.status})"
