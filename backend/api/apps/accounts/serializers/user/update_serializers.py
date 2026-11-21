from __future__ import annotations


from typing import Any
from apps.accounts import models
from rest_framework import serializers
from rest_framework.request import Request
from rest_framework.reverse import reverse
from core.policies.utils import current_user
from apps.accounts.models.enums import MessageRequestChoice


class UserSetPrivacySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ["is_private"]

class UserMessagePreference(serializers.ModelSerializer):
    class Meta:
        model = models.UserPreference
        fields = ["message_request_choice"]

class UserStatusPreferenceSerializer(serializers.Serializer):
    show_active_status = serializers.BooleanField(required=True)
