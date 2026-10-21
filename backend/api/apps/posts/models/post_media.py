

from django.db import models

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation

from apps.posts.models.utils import (
    post_image_upload_path,
    post_video_upload_path
)


class PostMedia(models.Model):
    """Model to store multiple media files for a post"""
    MEDIA_TYPE_CHOICES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        'posts.Post', on_delete=models.CASCADE, related_name='media_files')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)

    # Media fields - File uploads
    image_file = models.ImageField(
        upload_to=post_image_upload_path, blank=True, null=True)
    video_file = models.FileField(
        upload_to=post_video_upload_path, blank=True, null=True)

    # Media fields - URLs
    image_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    # Order for carousel display
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['post', 'order']),
        ]

    def __str__(self):
        return f"{self.post.id} - {self.media_type} - {self.order}"

    @property
    def media_url(self):
        """Return the appropriate media URL"""
        if self.media_type == 'IMAGE':
            if self.image_file:
                return self.image_file.url
            return self.image_url
        elif self.media_type == 'VIDEO':
            if self.video_file:
                return self.video_file.url
            return self.video_url
        return None
