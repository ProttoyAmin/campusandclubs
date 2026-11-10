from __future__ import annotations


from allauth.headless.base.response import get_config_data

from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from rest_framework.response import Response
from apps.accounts.services.auth_service import AuthService
from apps.accounts.views.auth.login import auth_response
from core.views.base import AuthAPIView


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
