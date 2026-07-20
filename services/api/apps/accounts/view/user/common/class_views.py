from typing import Any
from django.db.models import QuerySet
from rest_framework.response import Response
from rest_framework.request import Request
from apps.accounts.models import User
from rest_framework import generics

from core.views import PolicyMixin, ServiceMixin, PrivateResponseMixin
from apps.accounts.policies.user import UserPolicy
from apps.accounts.services import AccountService

from apps.accounts.serialize.user import UserProfileSerializer, PrivateUserSerializer

class UserRetrieveUpdateDestroyView(
    PolicyMixin[UserPolicy],
    ServiceMixin[AccountService],
    PrivateResponseMixin[User],
    generics.RetrieveUpdateDestroyAPIView
):
    """
    User Detail View
    """
    policy_class = UserPolicy
    service_class = AccountService
    private_serializer_class = PrivateUserSerializer
    private_detail_message = "This profile is private"

    # DRF class attributes
    serializer_class = UserProfileSerializer
    lookup_field = 'username'
    lookup_url_kwarg = 'username'

    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).get_by_username(username=self.kwargs['username'])

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user: User = self.get_object()
        policy = self.get_policy(request, user)

        if not policy.can_view_profile(viewer=user):
            return self.get_private_payload(user, request)

        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data)

class UserListCreateView(
    PolicyMixin[UserPolicy],
    ServiceMixin[AccountService],
    generics.ListCreateAPIView[User]
):
    """
    User List and Create View
    """
    service_class = AccountService
    serializer_class = UserProfileSerializer

    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).list_users()
