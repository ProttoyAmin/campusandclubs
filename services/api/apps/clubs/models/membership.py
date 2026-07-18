from typing import Any
from django.db import models
from django.conf import settings

from apps.clubs.models.club import Club
from apps.clubs.models.role import Role


class Membership(models.Model):
    """
    Now supports multiple roles per user through a ManyToMany relationship
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='club_memberships'
    )
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    # CHANGE: Changed from ForeignKey to ManyToManyField
    roles = models.ManyToManyField(
        Role,
        related_name='memberships',
        blank=True,
        help_text="User's roles in the club"
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    # Add a primary field to mark which role is primary/display
    primary_role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_for_memberships',
        help_text="Primary/display role for this membership"
    )

    class Meta:
        unique_together = ('user', 'club')
        indexes = [
            models.Index(fields=['user', 'club']),
        ]

    def __str__(self):
        role_names = ", ".join([role.name for role in self.roles.all()])
        return f"{self.user.username} in {self.club.name} ({role_names})"

    @property
    def role_names(self):
        """Get list of role names"""
        return [role.name for role in self.roles.all()]

    @property
    def display_role(self):
        """Get primary role or first role"""
        if self.primary_role:
            return self.primary_role
        return self.roles.first()

    def has_permission(self, permission_name: str) -> bool:
        """Check if user has any permission through any role"""
        for role in self.roles.all():
            if role.has_permission(permission_name):
                return True
        return False

    def user_permissions(self):
        """Get a set of all permissions the user has through their roles"""
        permissions = set()
        for role in self.roles.all():
            # All permissions are stored in the permissions JSON field
            for perm, has_perm in role.permissions.items():
                if has_perm:
                    permissions.add(perm)
        return permissions

    def add_role(self, role, set_as_primary=False):
        """Add a role to this membership"""
        self.roles.add(role)
        if set_as_primary or not self.primary_role:
            self.primary_role = role
            self.save()

    def remove_role(self, role):
        """Remove a role from this membership"""
        self.roles.remove(role)
        if self.primary_role == role:
            # Set new primary role
            new_primary = self.roles.first()
            self.primary_role = new_primary
            self.save()

    def set_primary_role(self, role):
        """Set a specific role as primary"""
        if role in self.roles.all():
            self.primary_role = role
            self.save()
            return True
        return False

