"""
Message model and related status/attachment tables for the realtime chat app.

Design notes
------------
* ``Message`` is the core chat-event row. Only text messages were supported
  originally; ``msg_type`` and ``MessageAttachment`` extend this to images,
  videos, files, voice notes, stickers, and system events without breaking
  existing clients (``msg_type`` defaults to TEXT).
* ``client_msg_id`` gives clients an idempotency key so that retries on flaky
  mobile networks do not produce duplicate messages.
* ``MessageStatus`` is the per-recipient delivery/read-receipt table. The
  ``last_read_at`` column on ``ChatParticipant`` is kept as a cheap
  "conversation-level" watermark for unread counts, while this table gives
  per-message check-marks (sent / delivered / seen).
"""


import uuid
from django.conf import settings
from django.db import models
from .chat import Chat
from .enums import MessageDeleteMode, MessageType, MessageAttachmentKind




class Message(models.Model):
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()

    # Client-generated idempotency key — see module docstring.
    client_msg_id = models.UUIDField(null=True, blank=True, db_index=True, unique=False)

    msg_type = models.CharField(
        max_length=16,
        choices=MessageType.choices,
        default=MessageType.TEXT,
    )

    reply_to = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies"
    )

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
    """Per-recipient receipt (sent / delivered / seen) for a single message."""
    class Status(models.TextChoices):
        SENT = "sent", "Sent"
        DELIVERED = "delivered", "Delivered"
        SEEN = "seen", "Seen"

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="statuses")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SENT)
    
    delivered_at = models.DateTimeField(null=True, blank=True)
    seen_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("message", "user")
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["message", "status"]),
        ]

class MessageAttachment(models.Model):
    """A piece of media attached to a message.

    ``file_url`` / ``thumb_url`` can point to any location; in practice we
    populate them from a Cloudinary upload (either directly via
    CloudinaryField or by referencing a :class:`apps.media.models.Media`
    row that already uploaded the file).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    kind = models.CharField(
        max_length=16,
        choices=MessageAttachmentKind.choices,
        default=MessageAttachmentKind.FILE,
    )
    # Optional link back to the Media row (when file was uploaded via the
    # /api/v1/media/ endpoint). Kept nullable so callers can pass raw URLs
    # too (e.g. client-side signed Cloudinary uploads).
    media = models.ForeignKey(
        "media.Media",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="message_attachments",
    )
    file_url = models.URLField(max_length=500)
    thumb_url = models.URLField(max_length=500, null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    duration_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [models.Index(fields=["message", "created_at"])]
