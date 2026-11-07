from rest_framework.serializers import BaseSerializer

from apps.accounts.dtos.profile_update_dto import UpdateAttrs
from typing import TypedDict
from apps.accounts.schema.user.user_profile import update_minimal_user_schema
from apps.accounts.serializers.user.profile import UserUpdateSerializer
from typing import Any
from django.db.models import QuerySet
from rest_framework.response import Response
from rest_framework.request import Request
from apps.accounts.models import User
from rest_framework import generics, permissions, status

from apps.accounts.views.auth.login import auth_response
from core.policies.utils import current_user
from core.views import PolicyMixin, ServiceMixin, PrivateResponseMixin
from core.pagination import StandardResultsSetPagination
from apps.accounts.policies.user import UserPolicy
from apps.accounts.services import AccountService
from apps.accounts.serializers.user.social_serializers import ProviderTokenSerializer, DisconnectProviderSerializer
from apps.accounts.serializers.user.change_password_serializer import ChangePasswordSerializer
from apps.accounts.serializers.user import EmailSerializerInput, UserEmailSerializer, ConfirmCodeSerializer, MakeEmailPrimaryInput
from apps.accounts.serializers.user import UserProfileSerializer, PrivateUserSerializer
from apps.accounts.serializers.user.profile import UserMinimalSerializer
from apps.accounts.schema.user.user_profile import (
    list_users_schema,
    retrieve_user_by_username_schema,
    update_user_by_username_schema,
    partial_update_user_by_username_schema,
    destroy_user_by_username_schema,
)
from drf_spectacular.utils import extend_schema_view
from core.views.base import AuthAPIView, BaseAPIView
from apps.accounts.services.credential_service import CredentialService
from allauth.account.models import EmailAddress

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
    generics.RetrieveAPIView
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
        return self.get_service(self.request).repository.get_queryset().filter(
            username=self.kwargs.get('username')
        )

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        user: User = self.get_object()
        policy = self.get_policy(request, user)

        if not policy.can_view_profile(viewer=user):
            return self.get_private_payload(user, request)

        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data)


@extend_schema_view(
    list=list_users_schema,
    retrieve=retrieve_user_by_username_schema,
    update=update_minimal_user_schema,
)
class MeRetreiveUpdateView(
    PolicyMixin[UserPolicy, User],
    ServiceMixin[AccountService],
    PrivateResponseMixin[User],
    generics.GenericAPIView
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
    serializer_class = UserUpdateSerializer

    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).repository.get_queryset().filter(
            username=current_user(self.request).username
        )

    def get(self, request: Request) -> Response:
        user: User = current_user(request)
        policy = self.get_policy(request, user)

        if not policy.can_view_profile(viewer=user):
            return self.get_private_payload(user, request)

        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data)

    def patch(self, request: Request) -> Response:
        user: User = current_user(request)
        policy = self.get_policy(request, user)

        if not policy.can_edit_profile(viewer=user):
            return self.get_private_payload(user, request)

        serializer = self.get_serializer(user, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)

        data = UpdateAttrs(
            first_name=serializer.validated_data.get('first_name'),
            last_name=serializer.validated_data.get('last_name'),
            bio=serializer.validated_data.get('bio'),
            gender=serializer.validated_data.get('gender'),
        )

        self.get_service(request).update_user(data)
        
        return Response(serializer.data)

@list_users_schema
class UserListCreateView(
    PolicyMixin[UserPolicy, User],
    ServiceMixin[AccountService],
    generics.ListAPIView[User]
):
    """
    User List View
    """
    service_class = AccountService
    serializer_class = UserMinimalSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.AllowAny]



    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).list_users()


class ChangePasswordAPIView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request):

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        state = CredentialService(actor=current_user(request)).change_password(
            request._request,
            data.get("current_password"),
            data.get("new_password")
        )

        msg = "Password updated." if state.authenticated else "Password updated. Please sign in again."
        return auth_response(state, msg)

class ManageEmailAPIView(BaseAPIView):
    permission_classes = [permissions.IsAuthenticated]


    def get_serializer_class(self) -> type[BaseSerializer[EmailAddress]]:
        if self.request.method in ("POST", "DELETE"):
            return EmailSerializerInput
        elif self.request.method == "PATCH":
            return EmailSerializerInput
        return UserEmailSerializer

    def get(self, request: Request):
        data = CredentialService().list_emails(request._request)
        return Response({"success": True, "data": data})

    def post(self, request: Request):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = CredentialService(actor=current_user(request)).add_email(request._request, data=serializer.validated_data)
        return Response({"success": True, "data": data})

    def delete(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = CredentialService(actor=current_user(request)).remove_email(request._request, data=serializer.validated_data)
        return Response({"success" : True, "data" : data}, status=status.HTTP_200_OK)

    def patch(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = CredentialService(actor=current_user(request)).mark_email_primary(request._request, email=serializer.validated_data["email"])
        return Response({"success" : True, "data" : data}, status=status.HTTP_200_OK)


class ConfirmAddedEmailView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        s = ConfirmCodeSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        emails = CredentialService(actor=request.user).confirm_email(request._request, s.validated_data["code"])
        return Response({"success": True, "message": "Email verified.", "data": {"emails": emails}})


class ResendAddedEmailView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request):
        s = EmailSerializerInput(data=request.data)
        s.is_valid(raise_exception=True)
        data = CredentialService(actor=current_user(request)).resend_email_code(request._request, s.validated_data["email"])
        return Response({"success": True, "message": "Verification code sent.", "data": data})

class ManageProvidersView(AuthAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request):
        data = CredentialService(actor=current_user(request)).list_providers(request._request)
        return Response({"success": True, "data": data})

    def post(self, request: Request):
        s = ProviderTokenSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = CredentialService(actor=current_user(request)).connect_provider(request._request, s.validated_data)
        return Response({"success": True, "data": data})

    def delete(self, request: Request):
        s = DisconnectProviderSerializer(data=request.query_params)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        data = CredentialService(actor=current_user(request)).disconnect_provider(request._request, d["provider"], d["account"])
        return Response({"success": True, "data": data})