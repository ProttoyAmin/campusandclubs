from __future__ import annotations


from django.db import models
from .role import Role
from .club.club import Club
from .membership.membership import Membership


# class PermissionCodename(models.TextChoices):
#     CREATE_EVENT = "create_event", "Can create event"
#     MANAGE_POSTS = "manage_posts", "Can manage posts"
#     MANAGE_MEMBERS = "manage_members", "Can manage members"
#     MANAGE_ROLES = "manage_roles", "Can manage roles"
#     MANAGE_CLUBS = "manage_clubs", "Can manage clubs"
#     MANAGE_SETTINGS = "manage_settings", "Can manage settings"
    


# class ClubPermission(models.Model):
    
#     name: str = models.CharField(max_length=255)
#     club: Club = models.ForeignKey(
#         Club,
#         on_delete=models.CASCADE,
#         related_name='permissions'
#     )

#     codename: str = models.CharField(
#         max_length=100,
#         help_text="Strictly typed permission codename",
#         choices=PermissionCodename.choices
#     )

#     class Meta:
#         unique_together = ["club", "codename"]
#         verbose_name = "Club Permission"
#         verbose_name_plural = "Club Permissions"