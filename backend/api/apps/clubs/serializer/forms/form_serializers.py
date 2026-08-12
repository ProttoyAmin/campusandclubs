from typing import Any


from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request
from apps.clubs.models import MembershipApplication, Form, FormQuestion
from apps.clubs.models.club.club import Club

class QuestionSerializers(serializers.ModelSerializer):
    class Meta:
        model = FormQuestion
        fields = ['question', 'type', 'required', 'order']

class FormSerializers(serializers.ModelSerializer):
    questions = QuestionSerializers("questions", many=True)
    class Meta:
        model = Form
        fields = "__all__"

