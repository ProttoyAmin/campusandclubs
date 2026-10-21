from django.db import models
from django.conf import settings
from .chat import Chat

class ChatParticipant(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        LEFT = "left", "Left"
        REMOVED = "removed", "Removed"
        BLOCKED = "blocked", "Blocked"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_participations")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACCEPTED)

    is_admin = models.BooleanField(default=False)
    is_owner = models.BooleanField(default=False)
    
    is_muted = models.BooleanField(default=False)
    muted_until = models.DateTimeField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False)
    
    last_read_at = models.DateTimeField(null=True, blank=True)
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