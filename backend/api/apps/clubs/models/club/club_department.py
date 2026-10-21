import uuid
from django.db import models

class ClubDepartment(models.Model):
    """
    A department within a club.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    club = models.ForeignKey(
        "clubs.Club", on_delete=models.CASCADE, related_name="departments"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    head = models.OneToOneField(
        "clubs.Membership",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="headed_department",
        help_text="The member who heads this department",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "club_departments"
        constraints = [
            models.UniqueConstraint(
                fields=["club", "name"], name="unique_department_name_per_club"
            )
        ]
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.club.name})"