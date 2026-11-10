from __future__ import annotations

from rest_framework import status, permissions, authentication
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.schema import login_schema
from core.response import ApiResponse
from allauth.headless.account.views import LoginView as HeadlessLoginView
from allauth.account.forms import LoginForm as AllauthLoginForm
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from ...services.auth_service import AuthService, AuthState
from ...serializers.auth.login import LoginInputSerializer, RequestLoginCodeSerializer
from ...serializers.auth.register import AuthStateSerializer, ConfirmCodeSerializer
from core.views.base import AuthAPIView

# @login_schema
# class LoginView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer
    # form_class = AllauthLoginForm

    # def post(self, request: Request, *args, **kwargs) -> Response:
    #     from apps.accounts.config.constants import (
    #         REFRESH_COOKIE, ACCESS_COOKIE, COOKIE_MAX_AGE,
    #         REFRESH_COOKIE_MAX_AGE, COOKIE_SECURE, COOKIE_HTTPONLY,
    #         COOKIE_SAMESITE, COOKIE_PATH
    #     )

    #     response = super().post(request, *args, **kwargs)
    #     refresh = response.data.pop('refresh', None)
    #     access = response.data.pop('access', None)

    #     if refresh:
    #         response.set_cookie(
    #             key=REFRESH_COOKIE,
    #             value=refresh,
    #             max_age=REFRESH_COOKIE_MAX_AGE,
    #             httponly=COOKIE_HTTPONLY,
    #             secure=COOKIE_SECURE,
    #             samesite=COOKIE_SAMESITE,
    #             path=COOKIE_PATH,
    #         )

    #     if access:
    #         response.set_cookie(
    #             key=ACCESS_COOKIE,
    #             value=access,
    #             max_age=COOKIE_MAX_AGE,
    #             httponly=COOKIE_HTTPONLY,
    #             secure=COOKIE_SECURE,
    #             samesite=COOKIE_SAMESITE,
    #             path=COOKIE_PATH,
    #         )

    #     return response


def auth_response(state: AuthState, message: str, http_status=200) -> Response:
    return Response(
        {"success": True, "message": message, "data": AuthStateSerializer(state).data},
        status=http_status,
    )
@login_schema
class LoginView(AuthAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request: Request):
        s = LoginInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        state = AuthService().login(request._request, s.validated_data)
        msg = "Signed in." if state.authenticated else "Verification required."
        return auth_response(state, msg)


class RequestLoginCodeView(AuthAPIView):

    def post(self, request: Request):
        s = RequestLoginCodeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = AuthService().request_login_code(request._request, s.validated_data["email"])
        return Response({"success": True, "message": "If that email is registered, a code was sent.", "data": data})


class ConfirmLoginCodeView(AuthAPIView):

    def post(self, request: Request):
        s = ConfirmCodeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        state = AuthService().confirm_login_code(request._request, s.validated_data["code"])
        return auth_response(state, "Signed in." if state.authenticated else "Verification required.")


class ResendLoginCodeView(AuthAPIView):
    
    def post(self, request: Request):
        data = AuthService().resend_login_code(request._request)
        return Response({"success": True, "message": "Verification code sent.", "data": data})
