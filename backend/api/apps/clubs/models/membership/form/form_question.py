# form_question.py
from django.db import models
from .enums import QuestionType
from .form import Form

import uuid

class FormQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name="questions")
    question = models.TextField()
    type = models.CharField(max_length=30, choices=QuestionType.choices)
    required = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order"]
        indexes = [models.Index(fields=["form", "order"])]