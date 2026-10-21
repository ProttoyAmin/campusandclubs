import uuid
from django.db import models
from .choices import InstituteRole


class InstituteEmailDomain(models.Model):

    institute = models.ForeignKey(
        "institutes.Institute",
        on_delete=models.CASCADE,
        related_name="email_domains"
    )
    domain = models.CharField(max_length=255)
    domain_type = models.CharField(
        max_length=20,
        choices=InstituteRole.choices,
        default=InstituteRole.STUDENT
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ("institute", "domain")
        verbose_name = "Email Domain"
        verbose_name_plural = "Email Domains"
        ordering = ["-created_at"]
        db_table = "institute_email_domains"
        
        
    def __str__(self) -> str:
        return f"Email Domain for {self.institute.name}: {self.domain} ({self.domain_type})"