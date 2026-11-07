from __future__ import annotations


from allauth.headless.base.response import get_config_data
from allauth.account.internal.flows import password_change
from typing import Any
from allauth.headless.account.inputs import ChangePasswordInput
from allauth.decorators import rate_limit
from django.utils.decorators import method_decorator
from allauth.headless.base.views import AuthenticatedAPIView, ConfigView
from allauth.headless.base.response import AuthenticationResponse


from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator

from allauth.headless.account.views import (
    LoginView as _AllauthLoginView,
    SignupView as _AllauthSignupView,
    SessionView as _AllauthSessionView,
    ChangePasswordView as _AllauthChangePasswordView,
    ResetPasswordView as _AllauthResetPasswordView,
)
from allauth.headless.constants import Client

from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from apps.accounts.services.auth_service import AuthService
from apps.accounts.views.auth.login import auth_response
from core.views.base import AuthAPIView


_session_view = _AllauthSessionView.as_api_view(
    client=Client.BROWSER
)


class ConfigAPIView(AuthAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]

    def get(self, request: Request):
        return Response(get_config_data(request._request))

class SessionView(AuthAPIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]

    def get(self, request: Request):
        return auth_response(AuthService().get_state(request._request), "Session state.")
        
    def delete(self, request: Request):
        return auth_response(AuthService().logout(request._request), "Signed out.")



@ensure_csrf_cookie
def session_view(request: Request, *args, **kwargs):
    """GET /api/v1/accounts/auth/session/

    Returns the current session state — 401 with a flow token when not
    authenticated, or the serialized user when logged in. Useful on app
    boot.
    """
    return _session_view(request, *args, **kwargs)