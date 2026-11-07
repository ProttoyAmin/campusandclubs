# apps/accounts/auth/serializers.py
from typing import Any, cast
from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework.request import Request
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken

class SafeTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except get_user_model().DoesNotExist:
            raise InvalidToken("User no longer exists.")


class RefreshTokenSerializer(TokenRefreshSerializer):
    refresh = serializers.CharField(read_only=True)
    access = serializers.CharField(read_only=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, str]:
        from apps.accounts.config.constants import REFRESH_COOKIE

        print("inside custom serializer")
        # raise Exception("Custom RefreshSerializer is being used")
        request = cast(Request, self.context.get('request'))
        refresh = request.COOKIES.get(REFRESH_COOKIE)

        if not refresh:
            raise InvalidToken("No refresh cookie.")

        attrs["refresh"] = refresh

        data = super().validate(attrs)

        return data
