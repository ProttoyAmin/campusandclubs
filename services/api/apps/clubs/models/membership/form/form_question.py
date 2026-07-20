from django.db import models
from .enums import QuestionType


class MembershipApplicationForm(models.Model):
    """A question a club asks on its membership application form."""

    id = models.AutoField(primary_key=True)
    club = models.ForeignKey(
        "clubs.Club", on_delete=models.CASCADE, related_name="application_questions"
    )
    question = models.TextField()
    type = models.CharField(max_length=30, choices=QuestionType.choices)
    required = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order"]
        indexes = [models.Index(fields=["club", "order"])]
        verbose_name = "Membership Application Form"
        verbose_name_plural = "Membership Application Forms"
