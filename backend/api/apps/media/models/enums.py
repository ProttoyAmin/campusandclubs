from django.db import models

class MediaRole(models.TextChoices):
    AVATAR = "avatar"
    COVER = "cover"
    BANNER = "banner"
    LOGO = "logo"
    GALLERY = "gallery"
    ATTACHMENT = "attachment"