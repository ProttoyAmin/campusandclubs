
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation

from apps.posts.models.utils import (
    post_image_upload_path,
    post_video_upload_path
)

class Post(models.Model):
    """Unified post model for both regular user posts and club posts"""
    POST_TYPE_CHOICES = [
        ('TEXT', 'Text/Status'),
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video/Reel'),
        ('MIXED', 'Mixed Media'),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')

    # Club relationship (nullable - only set for club posts)
    club = models.ForeignKey(
        'clubs.Club',
        on_delete=models.CASCADE,
        related_name='posts',
        null=True,
        blank=True,
        help_text="If set, this is a club post"
    )

    # Content fields
    post_type = models.CharField(
        max_length=10, choices=POST_TYPE_CHOICES, default='TEXT')
    title = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional title (commonly used for club posts)"
    )
    content = models.TextField(blank=True, null=True)  # For captions or text

    image_file = models.ImageField(
        upload_to=post_image_upload_path, blank=True, null=True)
    video_file = models.FileField(
        upload_to=post_video_upload_path, blank=True, null=True)

    image_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    original_post = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reposts'
    )  # For share/repost functionality

    # Generic relations for likes, comments, shares
    likes = GenericRelation('interactions.Like', related_query_name='posts')
    comments = GenericRelation(
        'interactions.Comment', related_query_name='posts')
    shares = GenericRelation('interactions.Share', related_query_name='posts')

    # Meta info
    is_public = models.BooleanField(default=True)
    is_edited = models.BooleanField(default=False)
    is_pinned = models.BooleanField(
        default=False,
        help_text="For club posts: whether the post is pinned in the club"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author', '-created_at']),
            models.Index(fields=['club', '-created_at']),
            models.Index(fields=['post_type']),
            models.Index(fields=['is_public', '-created_at']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['club', 'is_pinned', '-created_at']),
        ]

    def __str__(self):
        if self.is_club_post:
            title_part = self.title or 'Untitled'
            return f"[Club: {self.club.name}] {title_part} by {self.author.username}"
        return f"{self.author.username} - {self.post_type} - {self.id}"

    @property
    def is_club_post(self):
        """Check if this is a club post"""
        return self.club is not None

    @property
    def like_count(self):
        """Count of likes on this post"""
        return self.likes.count()

    @property
    def comment_count(self):
        """Count of comments on this post (only root comments)"""
        return self.comments.filter(parent=None).count()

    @property
    def share_count(self):
        """Count of shares of this post"""
        return self.shares.count()

    @property
    def repost_count(self):
        """Count of reposts (posts that reference this as original)"""
        return self.reposts.filter(is_deleted=False).count()  # type: ignore

    @property
    def image(self):
        """Return file URL if available, otherwise return URL field"""
        if self.image_file:
            return self.image_file.url
        return self.image_url

    @property
    def video(self):
        """Return file URL if available, otherwise return URL field"""
        if self.video_file:
            return self.video_file.url
        return self.video_url

    def get_all_media(self):
        """Get all media files for this post (including PostMedia)"""
        media_list = []

        # Add single media if exists (backward compatibility)
        if self.post_type == 'IMAGE' and (self.image_file or self.image_url):
            media_list.append({
                'type': 'IMAGE',
                'url': self.image,
                'order': 0
            })
        elif self.post_type == 'VIDEO' and (self.video_file or self.video_url):
            media_list.append({
                'type': 'VIDEO',
                'url': self.video,
                'order': 0
            })

        # Add multiple media from PostMedia
        for media in self.media_files.all():    # type: ignore
            media_list.append({
                'type': media.media_type,
                'url': media.media_url,
                'order': media.order
            })

        # Sort by order
        media_list.sort(key=lambda x: x['order'])
        return media_list

    def soft_delete(self):
        """Soft delete the post"""
        self.is_deleted = True
        self.save()

    def restore(self):
        """Restore a soft-deleted post"""
        self.is_deleted = False
        self.save()
