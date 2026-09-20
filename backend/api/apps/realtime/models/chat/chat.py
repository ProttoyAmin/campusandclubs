import uuid
from django.conf import settings
from django.db import models
from .enums import ChatType

class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, null=True, blank=True)
    club = models.ForeignKey("clubs.Club", on_delete=models.CASCADE, null=True, blank=True, related_name="chats")
    type = models.CharField(max_length=10, choices=ChatType.choices, default=ChatType.DIRECT)
    is_pinned = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.club:
            return f"Club Chat: {self.club.name}"
        if self.type == ChatType.DIRECT:
            return f"Direct Chat: {self.name}"
        return f"{self.type} Chat"