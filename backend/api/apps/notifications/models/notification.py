# apps/notifications/models.py
import uuid
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .enums import NotificationVerb

class Notification(models.Model):
    """
    Core notification model for tracking user notifications.
    Supports multiple notification types with polymorphic targets.
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'   
    )

    # polymorphic target
    target_ct = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    target_id = models.UUIDField(null=True, blank=True)
    target = GenericForeignKey('target_ct', 'target_id')


    verb = models.CharField(max_length=50, choices=NotificationVerb)
    description = models.TextField(blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    is_seen = models.BooleanField(default=False)

    read_at = models.DateTimeField(null=True, blank=True)
    seen_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'read_at']),
            models.Index(fields=['recipient', 'is_seen']),
            models.Index(fields=['recipient', 'seen_at']),
            models.Index(fields=['recipient', 'verb']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.verb}"

    def mark_as_read(self):
        """Mark this notification as read"""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])
        return self

    def mark_as_seen(self):
        """Mark this notification as seen"""
        if not self.is_seen:
            self.is_seen = True
            self.save(update_fields=['is_seen'])
        return self

    @classmethod
    def get_unread_count(cls, user):
        """Get count of unread notifications for a user"""
        return cls.objects.filter(recipient=user, is_read=False).count()

    @classmethod
    def get_unseen_count(cls, user):
        """Get count of unseen notifications for a user"""
        return cls.objects.filter(recipient=user, is_seen=False).count()

    @classmethod
    def mark_all_as_read(cls, user):
        """Mark all notifications as read for a user"""
        return cls.objects.filter(recipient=user, is_read=False).update(is_read=True)

    @classmethod
    def mark_all_as_seen(cls, user):
        """Mark all notifications as seen for a user"""
        return cls.objects.filter(recipient=user, is_seen=False).update(is_seen=True)

