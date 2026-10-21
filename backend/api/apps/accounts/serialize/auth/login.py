from typing import TypedDict
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.utils import timezone

from apps.accounts import models
from apps.accounts.repositories import UserRepository

class LoginSerializerData(TypedDict):
    username_or_email: str
    password: str


class LoginSerializer(serializers.Serializer):
    """Pure input validation — no auth logic here."""
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    generic_error = {"username_or_email": "Invalid credentials"}

    def validate(self, attrs: LoginSerializerData) -> dict[str, str]:
        username_or_email = attrs.get("username_or_email")
        password = attrs.get("password")
        repo = UserRepository()

        if "@" in username_or_email and username_or_email[0] != "@":
            try:
                user_obj = repo.get(email=username_or_email)
                username = user_obj.username
            except models.User.DoesNotExist:
                raise serializers.ValidationError(self.generic_error)
        else:
            username = username_or_email

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError(self.generic_error)

        # if not user.is_active:
        #     raise serializers.ValidationError(self.generic_error)

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }