# apps/notifications/models.py
import uuid
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .notification import Notification

# class NotificationTarget(models.Model):
#     """
#     Links notifications to their target content (posts, comments, etc.)
#     Uses GenericForeignKey for polymorphic relationships.
#     """
#     id = models.UUIDField(
#         primary_key=True, default=uuid.uuid4, editable=False)
#     notification = models.ForeignKey(
#         Notification,
#         on_delete=models.CASCADE,
#         related_name='targets'
#     )
#     content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
#     object_id = models.UUIDField()
#     content_object = GenericForeignKey('content_type', 'object_id')

#     class Meta:
#         indexes = [
#             models.Index(fields=['notification']),
#             models.Index(fields=['content_type', 'object_id']),
#         ]

#     def __str__(self):
#         return f"Target for notification {self.notification.id}: {self.content_type}"