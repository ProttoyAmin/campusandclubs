from django.db import models
from .application import MembershipApplication
from .form_question import MembershipApplicationForm

class MembershipApplicationResponse(models.Model):
    """A single answer to a single question, within one application."""

    id = models.AutoField(primary_key=True)
    application = models.ForeignKey(
        MembershipApplication, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        MembershipApplicationForm, on_delete=models.CASCADE, related_name="answers"
    )
    answer = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["application"])]
        constraints = [
            models.UniqueConstraint(
                fields=["application", "question"], name="unique_answer_per_question"
            )
        ]

