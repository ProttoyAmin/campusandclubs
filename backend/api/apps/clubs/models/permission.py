from __future__ import annotations


from django.db import models
from .club.club import Club

PERMISSIONS_LIST: list[tuple[str, str]] = [
    ("create_event", "Can create event"),
    ("manage_posts", "Can manage posts"),
    ("manage_members", "Can manage members"),
    ("manage_roles", "Can manage roles"),
    ("manage_club", "Can manage club"),
    ("manage_settings", "Can manage settings")
]


class PermissionCodename(models.TextChoices):
    CREATE_EVENT = "create_event", "Can create event"
    MANAGE_POSTS = "manage_posts", "Can manage posts"
    MANAGE_MEMBERS = "manage_members", "Can manage members"
    MANAGE_ROLES = "manage_roles", "Can manage roles"
    MANAGE_CLUBS = "manage_club", "Can manage club"
    MANAGE_SETTINGS = "manage_settings", "Can manage settings"


class ClubPermission(models.Model):

    name = models.CharField(max_length=255)

    codename = models.CharField(
        max_length=100,
        help_text="Strictly typed permission codename",
        choices=PermissionCodename.choices
    )

    class Meta:
        verbose_name = "Club Permission"
        verbose_name_plural = "Club Permissions"
