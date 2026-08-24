from django.db import models

from apps.clubs.models.club import Club
from apps.clubs.models.enums import ApplicationDecision


class ClubPreference(models.Model):
    club = models.OneToOneField(
        Club,
        on_delete=models.CASCADE,
        related_name="preferences",
    )

    # --- Membership / application behavior ---
    application_decision = models.CharField(
        max_length=20,
        choices=ApplicationDecision.choices,
        default=ApplicationDecision.MANUAL,
    )
    # add more here as needed, e.g.:
    # max_pending_applications = models.PositiveIntegerField(null=True, blank=True)
    allow_reapplication = models.BooleanField(default=True)
    leave_application = models.BooleanField(default=False)

    # --- Notifications ---
    notify_on_new_member = models.BooleanField(default=True)
    notify_on_new_application = models.BooleanField(default=True)
    notify_on_event_reminder = models.BooleanField(default=True)
    # add more here as needed, e.g.:
    # notify_on_new_post = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Club Preference"
        verbose_name_plural = "Club Preferences"
        db_table = "club_preferences"

    def __str__(self) -> str:
        return f"{self.club.slug} preferences"