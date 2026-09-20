from django.db import models
from django.conf import settings
from .chat import Chat

class ChatParticipant(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"      # DM sent, recipient hasn't accepted (message request)
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_participations")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACCEPTED)
    is_admin = models.BooleanField(default=False)          # group/club moderation
    last_read_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("chat", "user")