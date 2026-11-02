from django.db.models import QuerySet
from typing import Any


from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request
from apps.clubs.models import MembershipApplication
from apps.clubs.models.club.club import Club
from apps.taxonomy.models import Form, FormQuestion, QuestionType

class QuestionSerializers(serializers.ModelSerializer):
    class Meta:
        model = FormQuestion
        fields = ['id', 'question', 'type', 'required', 'options', 'order', 'answers']

        
class QuestionCreateSerializer(serializers.Serializer):
    question = serializers.CharField()
    type = serializers.ChoiceField(
        choices=QuestionType.choices
    )
    required = serializers.BooleanField(default=False)
    options = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )

    def validate(self, attrs: dict):
        question_type = attrs.get('type')
        options = attrs.get('options')

        choice_types = {
            QuestionType.SINGLE_CHOICE,
            QuestionType.MULTIPLE_CHOICE
        }

        if question_type in choice_types:
            if len(options) < 2:
                raise serializers.ValidationError({
                    "options": "Choice questions must have at least two options."
                })

            if len(options) != len(set(options)):
                raise serializers.ValidationError({
                    "options": "Options must be unique."
                })

        elif options:
            raise serializers.ValidationError({
                "options": "Options are only allowed for choice questions."
            })

        return attrs

class FormSerializers(serializers.ModelSerializer):
    questions = QuestionSerializers("questions", many=True)
    class Meta:
        model = Form
        fields = "__all__"

class FormCreateSerializer(serializers.Serializer):
    questions = QuestionCreateSerializer(many=True)
    title = serializers.CharField(required=False)


class FormRetrieveSerializer(serializers.ModelSerializer):
    questions = QuestionSerializers("questions", many=True)
    class Meta:
        model = Form
        fields = ["id", "title", "is_active", "questions"]