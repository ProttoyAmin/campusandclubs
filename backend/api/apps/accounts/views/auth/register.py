from __future__ import annotations

from typing import Any

from django.utils.decorators import method_decorator
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from core.response import ApiError
from core.response import ApiResponse
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from ...schema.register import register_schema
from ...services.auth_service import AuthService
from ...serializers.auth.register import SignupSerializer, SignupResponseSerializer
from rest_framework.authentication import SessionAuthentication


@method_decorator([ensure_csrf_cookie, csrf_protect], name="dispatch")
@register_schema
class SignUpView(APIView):
    permission_classes = [permissions.AllowAny, ]
    authentication_classes = [SessionAuthentication]

    def post(self, request: Request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)


        result = AuthService.signup(request._request, data=serializer.validated_data)

        return Response(
            {
                "success": True,
                "message": "Verification code sent." if result.verification_required else "Signed up.",
                "data": SignupResponseSerializer(result).data,
            },
            status=status.HTTP_201_CREATED,
        )


# @register_schema
# class RegisterView(generics.CreateAPIView):
#     permission_classes = (permissions.AllowAny, )
#     serializer_class = RegisterSerializer

#     def create(self, request: Request, *args: Any, **kwargs: Any) -> ApiResponse | ApiError:
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             instance = serializer.save()
#             return ApiResponse(
#                 data=self.get_serializer(instance).data,
#                 message="Created successfully.",
#                 status_code=status.HTTP_201_CREATED,
#             )
#         return ApiError(
#             message="Validation failed.",
#             errors={field: [str(m) for m in msgs] for field, msgs in serializer.errors.items()},  # type: ignore
#             status_code=status.HTTP_400_BAD_REQUEST,
#         )
