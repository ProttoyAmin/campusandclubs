from django.db import models

class InstituteRole(models.TextChoices):
    STUDENT = "student", "Student"
    FACULTY = "faculty", "Faculty"
    STAFF = "staff", "Staff"
    ALUMNI = "alumni", "Alumni"