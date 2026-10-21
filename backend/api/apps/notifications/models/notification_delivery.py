from django.db import models
import uuid
from .notification import Notification
from .enums import NotificationStatus, NotificationChannel

class NotificationDelivery(models.Model):
    """
    Tracks delivery status for different notification channels.
    Allows tracking of push notifications, email, SMS, etc.
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='deliveries'
    )
    channel = models.CharField(max_length=20, choices=NotificationChannel)
    status = models.CharField(
        max_length=20, choices=NotificationStatus, default=NotificationStatus.PENDING)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('notification', 'channel')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification', 'channel']),
            models.Index(fields=['status']),
            models.Index(fields=['channel', 'status']),
        ]
        verbose_name = 'Notification Delivery'
        verbose_name_plural = 'Notification Deliveries'

    def __str__(self):
        return f"Delivery {self.notification.id} via {self.channel}: {self.status}"

    def mark_as_sent(self):
        """Mark this delivery as sent"""
        from django.utils import timezone
        self.status = NotificationStatus.SENT
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at', 'updated_at'])
        return self

    def mark_as_delivered(self):
        """Mark this delivery as delivered"""
        from django.utils import timezone
        self.status = NotificationStatus.DELIVERED
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at', 'updated_at'])
        return self

    def mark_as_failed(self, error_message=None):
        """Mark this delivery as failed"""
        self.status = NotificationStatus.FAILED
        if error_message:
            self.error_message = error_message
        self.save(update_fields=['status', 'error_message', 'updated_at'])
        return self
