# apps/clubs/models/department_template.py
import uuid
from django.db import models


class DepartmentTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "department_templates"

    def __str__(self) -> str:
        return self.name
