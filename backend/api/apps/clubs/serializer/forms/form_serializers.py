from __future__ import annotations

from rest_framework import serializers

from apps.clubs.models import Form, FormQuestion
from apps.clubs.models.membership.form.enums import QuestionType


class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = FormQuestion
        fields = ["id", "question", "type", "required", "order"]

    def validate_type(self, value):
        valid = {qt.value for qt in QuestionType}
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid question type '{value}'. Valid: {sorted(valid)}"
            )
        return value


class FormSerializer(serializers.ModelSerializer):
    """Read + write serializer for the generic Form model.

    On writes, the owner (GenericFK) is injected by the view/service; the
    caller passes only ``title``, ``is_active`` and ``questions`` list.
    Nested creates/update of questions is handled at the service/repo
    layer — this serializer validates the payload shape.
    """

    questions = QuestionSerializer(many=True, required=False, default=list)

    class Meta:
        model = Form
        fields = ["id", "title", "is_active", "questions", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_questions(self, value):
        if not value:
            return value
        for i, q in enumerate(value):
            if not q.get("question"):
                raise serializers.ValidationError(
                    f"Question at index {i} is missing 'question' text."
                )
        return value
