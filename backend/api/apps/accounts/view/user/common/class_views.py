from typing import Any
from django.db.models import QuerySet
from rest_framework.response import Response
from rest_framework.request import Request
from apps.accounts.models import User
from rest_framework import generics, permissions

from core.views import PolicyMixin, ServiceMixin, PrivateResponseMixin
from core.pagination import StandardResultsSetPagination
from apps.accounts.policies.user import UserPolicy
from apps.accounts.services import AccountService

from apps.accounts.serialize.user import UserProfileSerializer, PrivateUserSerializer
from apps.accounts.serialize.user.profile import UserMinimalSerializer
from apps.accounts.schema.user.user_profile import (
    list_users_schema,
    retrieve_user_by_username_schema,
    update_user_by_username_schema,
    partial_update_user_by_username_schema,
    destroy_user_by_username_schema,
)
from drf_spectacular.utils import extend_schema_view





@extend_schema_view(
    list=list_users_schema,
    retrieve=retrieve_user_by_username_schema,
    update=update_user_by_username_schema,
    partial_update=partial_update_user_by_username_schema,
    destroy=destroy_user_by_username_schema,
)
class UserRetrieveUpdateDestroyView(
    PolicyMixin[UserPolicy, User],
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
    permission_classes = [permissions.IsAuthenticated]

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


@list_users_schema
class UserListCreateView(
    PolicyMixin[UserPolicy, User],
    ServiceMixin[AccountService],
    generics.ListCreateAPIView[User]
):
    """
    User List and Create View
    """
    service_class = AccountService
    serializer_class = UserMinimalSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.AllowAny]



    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).list_users()
