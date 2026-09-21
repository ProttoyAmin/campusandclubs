from __future__ import annotations


import uuid
from django.db import models
from .enums import ChatType

class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, null=True, blank=True)
    avatar = models.URLField(max_length=500, null=True, blank=True)
    description = models.CharField(max_length=500, null=True, blank=True)

    club = models.ForeignKey("clubs.Club", on_delete=models.CASCADE, null=True, blank=True, related_name="chats")
    type = models.CharField(max_length=10, choices=ChatType.choices, default=ChatType.DIRECT)

    is_pinned = models.BooleanField(default=False)
    
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