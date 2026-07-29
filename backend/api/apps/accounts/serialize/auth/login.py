from typing import TypedDict
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.utils import timezone

from apps.accounts import models


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

    def validate(self, attrs: LoginSerializerData) -> dict[str, str]:
        username_or_email = attrs.get("username_or_email")
        password = attrs.get("password")

        if "@" in username_or_email and username_or_email[0] != "@":
            try:
                user_obj = models.User.objects.get(email=username_or_email)
                username = user_obj.username
            except models.User.DoesNotExist:
                raise serializers.ValidationError(
                    "No account found with this email.")
        else:
            username = username_or_email

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                {"username_or_email": "No username or password found in our database"})

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
