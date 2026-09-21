from django.db import models
from django.conf import settings
from .chat import Chat

class ChatParticipant(models.Model):
    """A user's membership in a chat.

    ``status`` is the single source of truth for whether a chat appears in
    the main inbox, the requests inbox, or is hidden. One table, one
    column — no parallel MessageRequest model needed. Group invites
    reuse the same PENDING status.

    Status lifecycle:
        PENDING   → message/group-invite request waiting on the user.
                    Chat appears in "Message Requests", messages are
                    visible but notifications are silenced.
        ACCEPTED  → active member. Chat is in the main inbox; full
                    read/write/notifications.
        DECLINED  → user rejected an incoming PENDING invite/request.
                    Sender-side history preserved; recipient can't be
                    messaged again without a new request.
        LEFT      → user voluntarily left an ACCEPTED chat (e.g. left a
                    group). History visible but can't send/receive until
                    re-added.
        REMOVED   → user was kicked/banned by an admin after ACCEPTED.
        BLOCKED   → user blocked the other side (DM) or the chat; hides
                    it from the inbox and prevents further messages.
    """
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        JOINED = "joined", "Joined"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        LEFT = "left", "Left"
        BLOCKED = "blocked", "Blocked"
        REMOVED = "removed", "Removed"

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_participations")


    status = models.CharField(max_length=10, choices=Status.choices, default=Status.JOINED)

    is_admin = models.BooleanField(default=False)          # group/club moderation
    is_owner = models.BooleanField(default=False)
    
    last_read_at = models.DateTimeField(null=True, blank=True)

    is_muted = models.BooleanField(default=False)
    muted_until = models.DateTimeField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False)

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