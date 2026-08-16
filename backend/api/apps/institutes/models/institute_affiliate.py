import uuid
from apps.institutes.models.choices import AffiliationStatus, VerificationMethod
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
        related_name="affiliations",
    )

    reviewed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reviewed_affiliations",
    )

    role = models.CharField(
        max_length=20,
        choices=InstituteRole.choices,
        default=InstituteRole.STUDENT,
    )

    status = models.CharField(
        max_length=20,
        choices=AffiliationStatus.choices,
        default=AffiliationStatus.PENDING,
    )

    verification_method = models.CharField(
        max_length=20,
        choices=VerificationMethod.choices,
        default=VerificationMethod.EMAIL
    )

    verification_token = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)

    rejection_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )
    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )
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
        # type: ignore
        return f"{self.user.username} • {self.institute.name} ({self.get_role_display()})"
