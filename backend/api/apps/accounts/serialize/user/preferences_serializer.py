from apps.accounts.models import UserPreference
from rest_framework import serializers
from typing import Any

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        exclude = ["user"]
        read_only_fields = ['id', 'created_at', 'updated_at']