"""Per-user "deleted for me" tombstones.

We don't delete the row for everyone when a user picks "delete for me";
instead we record a tombstone and filter it out of their history view.
"""
from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models

from .message import Message


class UserMessageHidden(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hidden_messages",
    )
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="hidden_for",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "message")
        indexes = [models.Index(fields=["user", "message"])]
