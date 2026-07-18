from typing import Any
from django.db import models
import uuid
from django.conf import settings


class Club(models.Model):
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('closed', 'Closed'),
        ('secret', 'Secret')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    origin = models.ForeignKey(
        "institutes.Institute",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clubs",
        help_text="Null means local / global / cross-institute club"
    )
    about = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    avatar = models.URLField(blank=True, null=True)
    banner = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=True, help_text="True if club is open to all institutes")
    is_visible = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='club_owner')
    privacy = models.CharField(
        max_length=20, choices=PRIVACY_CHOICES, default='public')
    allow_public_posts = models.BooleanField(default=True)
    rules = models.TextField(blank=True, null=True, default='',
                             help_text="Club rules and guidelines")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='clubs',
        through='Membership',
        blank=True
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['name', 'origin']),
            models.Index(fields=['privacy', 'is_active']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'origin'],
                name='unique_club_per_institute'
            )
        ]

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            self.slug = f"{self.origin.code if self.origin else 'global'}-{base_slug}".lower()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.origin})"

    @property
    def total_members(self) -> int:
        return self.members.count()

    @property
    def total_posts(self) -> int:
        return self.posts.filter(is_deleted=False).count()  # type: ignore

    @property
    def total_events(self) -> int:
        return self.events.count()  # type: ignore

    def get_members_by_role(self, role_name):
        """Get all members with a specific role"""
        return self.members.filter(
            memberships__role__name__iexact=role_name
        ).distinct()

    def get_all_roles_with_members(self):
        """Get all roles with their members"""
        from collections import defaultdict
        from apps.clubs.models import Membership
        roles_members = defaultdict(list)

        memberships = Membership.objects.filter(
            club=self).select_related('role', 'user')
        for membership in memberships:
            role_name = membership.roles.name if membership.roles else "Member"
            roles_members[role_name].append(membership.user)

        return dict(roles_members)
