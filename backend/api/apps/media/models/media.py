from cloudinary.utils import cloudinary_url
from typing import TYPE_CHECKING
from apps.media.models.enums import MediaRole, MediaStatus
from django.db import models
from django.db.models import Q
from cloudinary.models import CloudinaryField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


if TYPE_CHECKING:
    from apps.accounts.models import User
    from apps.posts.models import Post
    from apps.clubs.models import Club

    from django.db.models.fields.related_descriptors import RelatedManager

# Create your models here.
class Media(models.Model):
    
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )

    object_id = models.UUIDField()
    content_object = GenericForeignKey(
        "content_type",
        "object_id"
    )


    file = CloudinaryField("media")
    original_file_name = models.CharField(
        max_length=255,
        blank=True
    )
    mime_type = models.CharField(max_length=100, blank=True)
    bytes = models.PositiveBigIntegerField(null=True, blank=True)

    role = models.CharField(
        max_length=20, choices=MediaRole.choices
    )

    position = models.PositiveIntegerField(default=0)

    public_id = models.CharField(max_length=255, null=True, blank=True)
    resource_type = models.CharField(max_length=20, blank=True)
    format = models.CharField(max_length=20, blank=True)
    version = models.PositiveBigIntegerField(null=True, blank=True)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    duration = models.FloatField(null=True, blank=True)

    url = models.URLField(null=True, blank=True)
    secure_url = models.URLField(null=True, blank=True)
    playback_url = models.URLField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=MediaStatus.choices,
        default=MediaStatus.PENDING
    )
    staged_file = models.FileField(upload_to="media_staging/", null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    removed_at = models.DateTimeField(null=True, blank=True)

    _raw = models.JSONField(null=True, blank=True)
    extra_metadata = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["position"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=~Q(status=MediaStatus.READY) | Q(public_id__isnull=False),
                name="ready_requires_public_id",
            )
        ]

    def build_url(self, **transformation) -> str | None:
        """Build a delivery URL on demand, e.g. media.url(width=300, height=300, crop="fill")."""
        if self.status != MediaStatus.READY:
            return self.staged_file.url if self.staged_file else None
        url, _ = cloudinary_url(
            self.public_id,
            resource_type=self.resource_type,
            version=self.version,
            secure=True,
            fetch_format="auto",
            quality="auto",
            **transformation,
        )
        return url


    if TYPE_CHECKING:
        users: RelatedManager["User"]
        clubs: RelatedManager["Club"]
        posts: RelatedManager["Post"]


    def __str__(self):
        return f"{self.role} media ({self.status}) for {self.content_object}"