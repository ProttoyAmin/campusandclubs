from django.db.models import QuerySet
from typing import Any


from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request
from apps.clubs.models import MembershipApplication, Form, FormQuestion, QuestionType
from apps.clubs.models.club.club import Club

class QuestionSerializers(serializers.ModelSerializer):
    class Meta:
        model = FormQuestion
        fields = ['id', 'question', 'type', 'required', 'order', 'answers']

        
class QuestionCreateSerializer(serializers.Serializer):
    question = serializers.CharField()
    type = serializers.ChoiceField(
        choices=QuestionType.choices
    )
    required = serializers.BooleanField(default=False)

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