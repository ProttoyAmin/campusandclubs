from django.db import models

from apps.institutes.models.choices import InstituteRole


class InstituteAffiliate(models.Model):
    institute = models.ForeignKey(
        "institutes.Institute",
        on_delete=models.CASCADE,
        related_name="affiliates",
    )

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="institute_affiliations",
    )

    role = models.CharField(
        max_length=20,
        choices=InstituteRole.choices,
        default=InstituteRole.STUDENT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    removed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "institute_affiliates"
        verbose_name = "Institute Affiliate"
        verbose_name_plural = "Institute Affiliates"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["institute", "user"],
                name="unique_institute_affiliation",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user.username} • {self.institute.name} ({self.get_role_display()})"      # type: ignore

