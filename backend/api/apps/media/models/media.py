from typing import TYPE_CHECKING
from apps.media.models.enums import MediaRole
from django.db import models
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

    role = models.CharField(
        max_length=20, choices=MediaRole.choices
    )

    position = models.PositiveIntegerField(default=0)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    removed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["position"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]

    if TYPE_CHECKING:
        users: RelatedManager["User"]
        clubs: RelatedManager["Club"]
        posts: RelatedManager["Post"]


    def __str__(self):
        return f"{self.role} media for {self.content_object}"