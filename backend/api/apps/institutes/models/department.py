import uuid
from django.db import models


class Department(models.Model):
    """Model representing a department within an institute (e.g., Computer Science, Mathematics) --- Optional"""
    id = models.UUIDField(
        primary_key=True, unique=True, editable=False, default=uuid.uuid4
    )
    institute = models.ForeignKey('institutes.Institute', on_delete=models.CASCADE, null=True, related_name='departments')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ["-created_at"]
        db_table = "departments"

    def __str__(self) -> str:
        return f"{self.institute.name} - {self.name} ({self.code})"