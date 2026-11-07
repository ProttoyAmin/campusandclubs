from django.views.decorators.csrf import ensure_csrf_cookie

from apps.accounts.views.auth.login import auth_response
from ...services.auth_service import AuthService
from allauth.headless.account.views import (
    ResetPasswordView as _AllauthResetPasswordView,
)
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from allauth.headless.constants import Client
from rest_framework.request import Request
from rest_framework.response import Response
from ...serializers.auth.password_reset import PasswordResetConfirmSerializer, VerifyResetCodeSerializer, PasswordResetRequestSerializer
from core.views.base import AuthAPIView

_reset_password_view = _AllauthResetPasswordView.as_api_view(
    client=Client.BROWSER
)


@ensure_csrf_cookie
def reset_password_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/reset-password/"

    Accepts allauth's ResetPasswordInput (new password). Returns allauth's
    AuthenticationResponse on success.
    """
    return _reset_password_view(request, *args, **kwargs)


class PasswordResetRequestView(AuthAPIView):
    
    def post(self, request: Request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = AuthService().request_password_reset(request._request, serializer.validated_data)
        return Response({"success": True, "message": "If that email is registered, a code was sent.", "data": data})

class PasswordResetVerifyView(AuthAPIView):

    def post(self, request: Request):
        serializer = VerifyResetCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = AuthService().verify_reset_code(request._request, serializer.validated_data)
        return Response({"success": True, "message": "Code confirmed.", "data": data})

class PasswordResetConfirmView(AuthAPIView):

    def post(self, request: Request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        state = AuthService().confirm_password_reset(request._request, data.get("code"), data["password1"])
        msg = "Password reset." if state.authenticated else "Password reset. Please sign in."
        return auth_response(state, msg)