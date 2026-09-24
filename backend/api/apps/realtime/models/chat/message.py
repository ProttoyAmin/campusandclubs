import uuid
from django.conf import settings
from django.db import models
from .chat import Chat

class MessageDeleteMode(models.TextChoices):
    """Describes how a deleted message should be treated."""

    NONE = "NONE", "Not deleted"
    FOR_ME = "FOR_ME", "Deleted for me"
    FOR_EVERYONE = "FOR_EVERYONE", "Deleted for everyone"

class Message(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()

    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )

    
    # Client-generated idempotency key — see module docstring.
    client_msg_id = models.UUIDField(null=True, blank=True, db_index=True, unique=False)

    is_pinned = models.BooleanField(default=False)

    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_mode = models.CharField(
        max_length=16,
        choices=MessageDeleteMode.choices,
        default=MessageDeleteMode.NONE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            # Message history ("get messages for a chat ordered by created_at")
            # is the hottest query in the system.
            models.Index(fields=["chat", "created_at"]),
            # Unread-count watermarks per participant.
            models.Index(fields=["sender", "created_at"]),
        ]

    def __str__(self):
        return f"Message {self.id} from {self.sender.username} in {self.chat}"

class MessageStatus(models.Model):
    class Status(models.TextChoices):
        SENT = "sent", "Sent"
        DELIVERED = "delivered", "Delivered"
        SEEN = "seen", "Seen"

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="statuses")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SENT)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("message", "user")