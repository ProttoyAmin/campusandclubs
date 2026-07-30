from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.request import Request

from apps.accounts.models import User
from apps.accounts.serialize.user import (
    UserTypeSerializer,
    UserSerializer
)
from apps.accounts.services.user_service import AccountService
from apps.accounts.policies.user import UserPolicy
from core.views import PolicyMixin, ServiceMixin


class ValidateUserTypeView(PolicyMixin[UserPolicy, User], ServiceMixin[AccountService], generics.GenericAPIView):
    """
    Validate user type and institute.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserTypeSerializer
    policy_class = UserPolicy
    service_class = AccountService

    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).list_users()


    # def get(self, request: Request) -> Response:
    #     serializer = self.get_serializer()
    #     return Response(serializer.data)

    def post(self, request: Request) -> Response:
        from apps.institutes.services import AffiliateService
        affiliate_service = AffiliateService()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # if request.data:
        #     return Response(request.data)
        
        user: User = request.user  # type: ignore
        validated_data = serializer.validated_data
        
        affiliation = affiliate_service.create_affiliation(validated_data, user.id)
        user.type = affiliation.role
        user.professional_email = validated_data['professional_email']
        user.save()
        
        return Response({
            "message": "Type and institute assigned successfully.",
            "user_type": user.type,
            # "institute": user.affiliates.name,
            "data" : serializer.data
        }, status=status.HTTP_200_OK)


class CompleteUserInfoView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


