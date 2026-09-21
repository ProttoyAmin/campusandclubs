"""MessageRequest — the out-of-band "you have a DM waiting for you" record.

The actual chat/messages are only created *after* the recipient accepts the
request (the flow is managed by ``ChatService``). This avoids leaking empty
chats into the sender's chat list while the request is pending.
"""
from __future__ import annotations

from django.conf import settings
from django.db import models


class MessageRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_requests_sent",
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="message_requests_received",
    )
    # The DM chat created alongside this request (only for the new
    # start_dm flow; legacy requests created before this field may have
    # NULL here and use the older ChatParticipant.PENDING lookup).
    chat = models.ForeignKey(
        "realtime.Chat",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="message_requests",
    )
    content = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["to_user", "status", "-created_at"]),
            models.Index(fields=["from_user", "status", "-created_at"]),
        ]
