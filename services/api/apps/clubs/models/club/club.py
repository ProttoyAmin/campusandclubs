from typing import Any
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.clubs.models.enums import (
    Visibility,
    ClubStatus,
    MembershipScope,
    JoinMode
)

from apps.clubs.models.club.club_category import Category

# Visibility -> allowed JoinMode values, and the default for each.
_ALLOWED_JOIN_MODES: dict[str, tuple[str, ...]] = {
    Visibility.PUBLIC: (JoinMode.INSTANT, JoinMode.APPLICATION),
    Visibility.PRIVATE: (JoinMode.APPLICATION, JoinMode.INVITE_ONLY),
    Visibility.SECRET: (JoinMode.INVITE_ONLY,),
}


class Club(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    origin = models.ForeignKey(
        "institutes.Institute",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clubs",
        help_text="Null means local / global / cross-institute club",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="club_owner"
    )

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="clubs",
        through="Membership",
        blank=True,
    )

    privacy = models.CharField(
        max_length=20, choices=Visibility.choices, default=Visibility.PUBLIC
    )

    join_mode = models.CharField(
        max_length=20,
        choices=JoinMode.choices,
        default=JoinMode.INSTANT,
        help_text="How users join. Constrained by `privacy` — see clean().",
    )

    about = models.TextField(blank=True, null=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    avatar = models.URLField(blank=True, null=True)
    banner = models.URLField(blank=True, null=True)

    status = models.CharField(
        max_length=20, choices=ClubStatus.choices, default=ClubStatus.ACTIVE
    )

    scope = models.CharField(
        max_length=20, choices=MembershipScope.choices, default=MembershipScope.GLOBAL
    )

    allow_public_posts = models.BooleanField(default=True)
    enable_applications = models.BooleanField(default=False)

    rules = models.TextField(
        blank=True, null=True, default="", help_text="Club rules and guidelines"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="category",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["owner"]),
            models.Index(fields=["name", "origin"]),
            models.Index(fields=["privacy", "status"]),
            models.Index(fields=["scope", "status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "origin"], name="unique_club_per_institute"
            )
        ]

    def clean(self) -> None:
        allowed = _ALLOWED_JOIN_MODES.get(self.privacy, ())
        if self.join_mode not in allowed:
            raise ValidationError(
                {
                    "join_mode": (
                        f"'{self.join_mode}' is not valid for a "
                        f"'{self.privacy}' club. Allowed: {', '.join(allowed)}."
                    )
                }
            )

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            from django.utils.text import slugify

            base_slug = slugify(self.name)
            self.slug = f"{self.origin.code if self.origin else 'global'}-{base_slug}".lower()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.origin})"


    # --- DB-touching methods removed from the model ---
    # These belong in ClubRepository / ClubService now, paired with ClubPolicy
    # for anything that needs an authorization check (e.g. get_all_roles_with_members
    # arguably shouldn't be callable by just anyone).
    #
    # @property
    # def total_members(self) -> int:
    #     return self.members.count()
    #
    # @property
    # def total_posts(self) -> int:
    #     return self.posts.filter(is_deleted=False).count()
    #
    # @property
    # def total_events(self) -> int:
    #     return self.events.count()
    #
    # def get_members_by_role(self, role_name):
    #     return self.members.filter(memberships__role__name__iexact=role_name).distinct()
    #
    # def get_all_roles_with_members(self):
    #     from collections import defaultdict
    #     from apps.clubs.models import Membership
    #     roles_members = defaultdict(list)
    #     memberships = Membership.objects.filter(club=self).select_related('role', 'user')
    #     for membership in memberships:
    #         role_name = membership.roles.name if membership.roles else "Member"
    #         roles_members[role_name].append(membership.user)
    #     return dict(roles_members)