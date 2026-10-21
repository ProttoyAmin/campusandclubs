from typing import Any

from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from apps.accounts.serialize.auth.register import RegisterSerializer
from apps.accounts.schema import register_schema
from core.response import ApiError
from core.response import ApiResponse


@register_schema
class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny, )
    serializer_class = RegisterSerializer

    def create(self, request: Request, *args: Any, **kwargs: Any) -> ApiResponse | ApiError:
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return ApiResponse(
                data=self.get_serializer(instance).data,
                message="Created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        return ApiError(
            message="Validation failed.",
            errors={field: [str(m) for m in msgs] for field, msgs in serializer.errors.items()},  # type: ignore
            status_code=status.HTTP_400_BAD_REQUEST,
        )
