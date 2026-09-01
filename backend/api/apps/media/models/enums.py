from django.db import models


class MediaRole(models.TextChoices):
    POST = "post"
    AVATAR = "avatar"
    COVER = "cover"
    BANNER = "banner"
    LOGO = "logo"
    GALLERY = "gallery"
    ATTACHMENT = "attachment"
    OTHER = "other"
