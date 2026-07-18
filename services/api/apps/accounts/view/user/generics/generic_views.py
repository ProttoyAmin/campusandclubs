from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.request import Request

from apps.accounts.models import User
from apps.accounts.serialize.user import (
    UserTypeSerializer,
    UserSerializer
)

class ValidateUserTypeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserTypeSerializer

    def get(self, request: Request) -> Response:
        serializer = self.get_serializer()
        return Response(serializer.data)

    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user: User = request.user  # type: ignore
        validated_data = serializer.validated_data
        
        user.institute = validated_data['institute']
        user.type = validated_data['user_type']
        user.professional_email = validated_data['professional_email']
        user.save()
        
        return Response({
            "message": "Type and institute assigned successfully.",
            "user_type": user.type,
            "institute": user.institute.name,
            "data" : serializer.data
        }, status=status.HTTP_200_OK)


class CompleteUserInfoView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'