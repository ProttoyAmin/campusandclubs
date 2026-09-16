import uuid
from django.conf import settings
from django.db import models

class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="chat_rooms")
    club = models.ForeignKey("clubs.Club", on_delete=models.CASCADE, null=True, blank=True, related_name="chat_rooms")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.club:
            return f"Club Chat: {self.club.name}"
        participant_usernames = list(self.participants.values_list("username", flat=True))[:2]
        return f"Chat: {', '.join(participant_usernames)}"