# form_question.py
from django.db import models
from .enums import QuestionType
from .form import Form
import uuid
from .form_submission import FormSubmission
from django.core.exceptions import ValidationError
from django.db.models import Q

class FormQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="questions")
    question = models.TextField()
    type = models.CharField(max_length=30, choices=QuestionType.choices)
    required = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    options = models.JSONField(default=list, blank=True)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order"]
        indexes = [models.Index(fields=["form", "order"])]
        constraints = [
            models.CheckConstraint(
                condition=(
                    ~Q(type__in=[
                        QuestionType.SINGLE_CHOICE,
                        QuestionType.MULTIPLE_CHOICE
                    ]) | ~Q(options=[])
                ),
                name='choice_questions_require_options'
            )
        ]

    def clean(self):
        super().clean()

        if (
            self.type in (
                QuestionType.SINGLE_CHOICE,
                QuestionType.MULTIPLE_CHOICE,
            )
            and not self.options
        ):
            raise ValidationError({
                "options": "Choice questions must have at least one option."
            })


class FormAnswer(models.Model):
    """One answer to one question within a FormSubmission."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        FormSubmission, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        FormQuestion,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    answer = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["submission"])]
        constraints = [
            models.UniqueConstraint(
                fields=["submission", "question"],
                name="unique_answer_per_question_per_submission",
            )
        ]
        verbose_name = "Form Answer"
        verbose_name_plural = "Form Answers"

    def __str__(self) -> str:
        return f"answer to {self.question_id}"