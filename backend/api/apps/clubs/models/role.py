from django.db.models.query import QuerySet
from apps.clubs.models.permission import ClubPermission
from typing import Any
from django.db import models
import uuid
from apps.clubs.models.club import Club
from apps.clubs.models.permission import ClubPermission
from django.core.exceptions import ValidationError
from apps.accounts.models import User


class Role(models.Model):
    """Dynamic role model for clubs - allows custom roles with specific permissions"""
    DEFAULT_ROLE = 'Admin'
    DEFAULT_COLOR = "#8F2811"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    club = models.ForeignKey(
        Club, on_delete=models.CASCADE, related_name='roles')
    name = models.CharField(
        max_length=50, help_text="Role name (e.g., Member, Moderator, Admin)")

    # Consolidated permissions field
    permissions = models.ManyToManyField(
        ClubPermission,
        blank=True,
        null=True
    )

    is_default = models.BooleanField(
        default=False,
        help_text="Is this a default role (e.g., Member role for new joiners)"
    )
    color = models.CharField(
        max_length=7,
        blank=True,
        null=True,
        help_text="Hex color code for role display (e.g., #FF5733)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Unique role name per club (case-insensitive)
        constraints = [
            models.UniqueConstraint(
                fields=['club', 'name'],
                name='unique_role_name_per_club',
                condition=models.Q(name__isnull=False)
            )
        ]
        ordering = ['name']
        indexes = [
            models.Index(fields=['club', 'name']),
            models.Index(fields=['club', 'is_default']),
        ]

    def clean(self):
        """Validate that role name is case-insensitive unique within club"""
        if self.name:
            existing = Role.objects.filter(
                club=self.club,
                name__iexact=self.name
            ).exclude(id=self.id)

            if existing.exists():
                raise ValidationError(
                    f'A role with name "{self.name}" already exists in this club.'
                )

    # def save(self, *args, **kwargs):
    #     if self.name:
    #         self.name = self.name.strip()
    #     # Ensure permissions is a dict
    #     if not isinstance(self.permissions, ClubPermission):
    #         self.permissions = ClubPermission.objects.none()
    #     self.full_clean()
    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.club.name})"

    @property
    def is_admin(self):
        """Check if role has admin-level permissions"""
        return self.permissions.get('manage:settings', False) or (
            self.permissions.get('manage:members', False) and
            self.permissions.get('manage:posts', False)
        )

    def has_permission(self, permission_name: str) -> bool:
        """Check if role has a specific permission"""
        return self.permissions.filter(name=permission_name).exists()  # type: ignore

    # def set_permission(self, permission_name: str, value: bool):
    #     """Set a specific permission"""
    #     if not isinstance(self.permissions, dict):
    #         self.permissions = {}
    #     self.permissions[permission_name] = value
    #     self.save()

    def get_all_permissions(self) -> QuerySet[ClubPermission, Any]:
        """Get all permissions for this role"""
        return self.permissions.values_list('codename', flat=True)

    @property
    def users(self) -> QuerySet[User]:
        """Get all users who have this role"""
        return User.objects.filter(
            club_memberships__club=self.club,
            club_memberships__roles=self
        ).distinct()

    def user_count(self):
        return self.users.count()

    def create_default_owner_role(self, club):
        """Utility method to create default roles for a new club"""
        role = self.objects.create(
            club=club,
            name=self.DEFAULT_ROLE,
            is_default=True,
            color=self.DEFAULT_COLOR
        )

        # Add more later if needed

        # moderator_role = Role.objects.create(
        #     club=club,
        #     name='Moderator',
        #     permissions={
        #         'can_view_posts': True,
        #         'can_create_posts': True,
        #         'can_comment': True,
        #         'can_join_events': True,
        #         'can_manage_members': True,
        #         'can_manage_posts': True,
        #     }
        # )
        # admin_role = Role.objects.create(
        #     club=club,
        #     name='Admin',
        #     permissions={
        #         'can_view_posts': True,
        #         'can_create_posts': True,
        #         'can_comment': True,
        #         'can_join_events': True,
        #         'can_manage_members': True,
        #         'can_manage_posts': True,
        #         'can_manage_settings': True,
        #     }
        # )
        return role

    def get_default_ownder_role(self):
        return self.DEFAULT_ROLE
