from django.db import models

class ApplicationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    WITHDRAWN = "withdrawn", "Withdrawn"

class QuestionType(models.TextChoices):
    SHORT_TEXT = "short_text", "Short Text"
    LONG_TEXT = "long_text", "Long Text"
    NUMBER = "number", "Number"
    EMAIL = "email", "Email"
    URL = "url", "URL"
    SINGLE_CHOICE = "single_choice", "Single Choice"
    MULTIPLE_CHOICE = "multiple_choice", "Multiple Choice"