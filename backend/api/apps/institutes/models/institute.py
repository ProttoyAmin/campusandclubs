import uuid
from django.db import models


class Institute(models.Model):
    """Model representing an institute. (universitites, colleges, orgs, companies etc)"""
    id = models.UUIDField(
        primary_key=True, unique=True, editable=False, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    country = models.CharField(max_length=100)
    address = models.TextField()
    website = models.URLField(blank=True, null=True)
    portal = models.URLField(blank=True, null=True)
    courses = models.JSONField(
        default=dict, help_text="Dictionary of courses offered by the institute", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    logo = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    established_year = models.PositiveIntegerField(blank=True, null=True)
    accreditation = models.CharField(max_length=255, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    social_links = models.JSONField(
        default=dict, help_text="Dictionary of social media links", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Institute"
        verbose_name_plural = "Institutes"
        db_table = "institute"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['name', 'code']),
            models.Index(fields=['country']),
        ]
        
    def __str__(self) -> str:
        return self.name
        
    @property
    def get_active_email_domains(self):
        """Get all active email domains associated with the institute"""
        return self.email_domains.filter(is_active=True)
    
    

