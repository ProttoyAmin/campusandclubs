from __future__ import annotations

from rest_framework import serializers

from apps.accounts.serialize.user.profile import UserMinimalSerializer
from apps.clubs.models import FormQuestion, MembershipApplication
from apps.clubs.models.membership.form.enums import ApplicationStatus


# --------------------------------------------------------------------- #
# Inbound payloads
# --------------------------------------------------------------------- #
class AnswerPayloadSerializer(serializers.Serializer):
    """{ question_id, answer }"""

    question_id = serializers.UUIDField()
    answer = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )


class MembershipApplicationCreateSerializer(serializers.ModelSerializer):
    """Inbound serializer for POST /clubs/<id>/applications/.

    Accepts either a freeform ``message`` (when the club has no form) or
    an ``answers`` list keyed by question_id (when the club does).
    """

    message = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=1000
    )
    answers = AnswerPayloadSerializer(many=True, required=False, default=list)

    class Meta:
        model = MembershipApplication
        fields = ["message", "answers"]


# --------------------------------------------------------------------- #
# Read models
# --------------------------------------------------------------------- #
class _AnswerOutSerializer(serializers.Serializer):
    question_id = serializers.UUIDField(source="question.id")
    question = serializers.CharField(source="question.question")
    type = serializers.CharField(source="question.type")
    answer = serializers.CharField()


class FormSubmissionOutSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    form_id = serializers.UUIDField(source="form.id")
    submitted_at = serializers.DateTimeField()
    answers = _AnswerOutSerializer(many=True)


class MembershipApplicationSerializer(serializers.ModelSerializer):
    """Used for list/detail responses for admins reviewing applications."""

    applicant = UserMinimalSerializer(read_only=True)
    submission = FormSubmissionOutSerializer(read_only=True)

    class Meta:
        model = MembershipApplication
        fields = [
            "id",
            "club",
            "applicant",
            "message",
            "submission",
            "status",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
