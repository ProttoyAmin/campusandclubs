from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer
from apps.accounts.schema import login_response
from core.response import ApiResponse

@login_response
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        from apps.accounts.config.constants import (
            REFRESH_COOKIE, ACCESS_COOKIE, COOKIE_MAX_AGE,
            REFRESH_COOKIE_MAX_AGE, COOKIE_SECURE, COOKIE_HTTPONLY,
            COOKIE_SAMESITE, COOKIE_PATH
        )

        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop('refresh', None)
        access = response.data.pop('access', None)

        if refresh:
            response.set_cookie(
                key=REFRESH_COOKIE,
                value=refresh,
                max_age=REFRESH_COOKIE_MAX_AGE,
                httponly=COOKIE_HTTPONLY,
                secure=COOKIE_SECURE,
                samesite=COOKIE_SAMESITE,
                path=COOKIE_PATH,
            )

        if access:
            response.set_cookie(
                key=ACCESS_COOKIE,
                value=access,
                max_age=COOKIE_MAX_AGE,
                httponly=COOKIE_HTTPONLY,
                secure=COOKIE_SECURE,
                samesite=COOKIE_SAMESITE,
                path=COOKIE_PATH,
            )

        return response
