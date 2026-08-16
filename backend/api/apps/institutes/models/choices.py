from django.db import models


class InstituteRole(models.TextChoices):
    STUDENT = "student", "Student"
    FACULTY = "faculty", "Faculty"
    STAFF = "staff", "Staff"
    ALUMNI = "alumni", "Alumni"


class AffiliationStatus(models.TextChoices):
    PENDING = "pending", "Pending Verification"
    VERIFIED = "verified", "Verified"
    REJECTED = "rejected", "Rejected"


class VerificationMethod(models.TextChoices):
    EMAIL = "email", "Email Confirmation"
    MANUAL = "manual", "Manual Review"
