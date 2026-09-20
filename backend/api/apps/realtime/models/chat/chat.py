"""Chat (room) model — DIRECT / GROUP / CLUB."""
from __future__ import annotations

import uuid

from django.db import models

from .enums import ChatType


class Chat(models.Model):
    """A conversation container between two or more users.

    Three ``type`` values are supported:

    * ``DIRECT`` — one-to-one chat; ``club`` is NULL, ``name`` is usually NULL
      (derived from the other participant when rendering).
    * ``GROUP``  — named multi-user chat created by a user; ``club`` is NULL.
    * ``CLUB``   — a chat whose membership is controlled by a Club (auto-
                   synced; see ``apps.clubs`` signals). ``club`` is set.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, null=True, blank=True)
    avatar = models.URLField(max_length=500, null=True, blank=True)
    description = models.CharField(max_length=500, null=True, blank=True)

    club = models.ForeignKey(
        "clubs.Club",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chats",
    )
    type = models.CharField(
        max_length=10,
        choices=ChatType.choices,
        default=ChatType.DIRECT,
    )

    is_pinned = models.BooleanField(default=False)

    # Denormalized last activity timestamp. Maintained by the service layer
    # on every new message / reaction / edit so the chat-list query can sort
    # in one query without N+1 ``.messages.latest()`` subqueries.
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["club"]),
            models.Index(fields=["type", "created_at"]),
            models.Index(fields=["last_message_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        if self.club:
            return f"Club Chat: {self.club.name}"
        if self.type == ChatType.DIRECT:
            return f"Direct Chat: {self.name or self.id}"
        return f"{self.type} Chat: {self.name or self.id}"
