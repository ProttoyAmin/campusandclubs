from typing import Any


from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request
from apps.clubs.models import MembershipApplication
from apps.clubs.models.club.club import Club
from apps.accounts.serialize.user.profile import UserMinimalSerializer


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


class _AnswerOutSerializer(serializers.Serializer):
    question_id = serializers.UUIDField(source="question.id")
    question = serializers.CharField(source="question.question")
    type = serializers.CharField(source="question.type")
    answer = serializers.CharField()

class MembershipBulkApproveSerializer(serializers.Serializer):
    application_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True)


class FormSubmissionOutSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    form_id = serializers.UUIDField(source="form.id")
    submitted_at = serializers.DateTimeField()
    answers = _AnswerOutSerializer(many=True)