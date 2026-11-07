from typing import Any

from django.utils.decorators import method_decorator
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.serializers.auth.register import RegisterSerializer
from apps.accounts.schema import register_schema
from apps.accounts.serializers.user.profile import UserMinimalSerializer
from core.response import ApiError
from core.response import ApiResponse
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from ...services.auth_service import AuthService
from ...serializers.auth.register import ConfirmCodeSerializer
from rest_framework.authentication import SessionAuthentication

@method_decorator([ensure_csrf_cookie, csrf_protect], name="dispatch")
class ConfirmEmailCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request: Request):
        s = ConfirmCodeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        result = AuthService().confirm_email_code(request._request, s.validated_data["code"])
        return Response({
            "success": True,
            "message": "Email verified.",
            "data": {
                "authenticated": result.authenticated,
                "user": UserMinimalSerializer(result.user).data if result.user else None,
            },
        })


@method_decorator([ensure_csrf_cookie, csrf_protect], name="dispatch")
class ResendEmailCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        data = AuthService().resend_email_code(request._request)
        return Response({"success": True, "message": "Verification code sent.", "data": data})