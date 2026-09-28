from django.db import models
from django.conf import settings
from .notification import Notification


class NotificationActor(models.Model):
    """
    Tracks the actors (users who triggered the notification).
    A notification can have multiple actors (e.g., "John and 5 others liked your post")
    """
    id = models.BigAutoField(primary_key=True)
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='actors'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_actions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('notification', 'actor')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification', 'actor']),
        ]

    def __str__(self):
        return f"{self.actor.username} in notification {self.notification.id}"