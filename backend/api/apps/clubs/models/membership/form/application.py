from django.db import models
from django.conf import settings

from .enums import ApplicationStatus


class MembershipApplication(models.Model):
    """One user's submission to join a club. Not a Membership yet."""

    id = models.AutoField(primary_key=True)
    club = models.ForeignKey(
        "clubs.Club", on_delete=models.CASCADE, related_name="applications"
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="club_applications"
    )
    status = models.CharField(
        max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["club", "status"])]
        constraints = [
            # one pending application per user per club at a time
            models.UniqueConstraint(
                fields=["club", "applicant"],
                condition=models.Q(status="pending"),
                name="unique_pending_application_per_club",
            )
        ]
        verbose_name = "Membership Application"
        verbose_name_plural = "Membership Applications"
