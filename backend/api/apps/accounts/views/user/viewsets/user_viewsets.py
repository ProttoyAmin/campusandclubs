


from django.db.models import QuerySet
from rest_framework import (
    permissions,
    viewsets,
    mixins,
    status
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.serializers import Serializer
from apps.accounts.serializers.user.profile import UserMinimalSerializer
from core.mixins import PolicyMixin, ServiceMixin
from core.views.base import current_user
from apps.accounts.services import AccountService
from apps.accounts.policies.user import UserPolicy
from apps.accounts.models import User
from apps.accounts.serializers.user import (
    UserSetPrivacySerializer,
    UserMessagePreference,
    UserStatusPreferenceSerializer
)
from apps.accounts.serializers.user.preferences_serializer import UserPreferencesSerializer


class UserPrivacyUpdatesViewset(
    ServiceMixin[AccountService],
    PolicyMixin[UserPolicy, User],
    viewsets.GenericViewSet
):
    service_class = AccountService
    policy_class = UserPolicy
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[User]:
        return self.get_service(self.request).repository.get_queryset()

    def _authorize_edit(self) -> User | Response:
        user: User = current_user(self.request)
        policy = self.get_policy(self.request, user)

        if not policy:
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        decision = policy.can_edit_profile()

        if not decision:
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return user

    @action(
        detail=False,
        methods=["patch"],
        url_path="private",
        serializer_class=UserSetPrivacySerializer,
    )
    def update_privacy(self, request: Request) -> Response:
        user = self._authorize_edit()

        if isinstance(user, Response):
            return user

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = self.get_service(request).update_privacy(user, serializer.validated_data["is_private"])

        return Response(UserMinimalSerializer(data, context={"request" : request}).data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["patch"],
        url_path="message-request",
        serializer_class=UserMessagePreference,
    )
    def update_message_preference(self, request: Request) -> Response:
        user = self._authorize_edit()

        if isinstance(user, Response):
            return user

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = self.get_service(request).update_message_privacy(user, serializer.validated_data["message_request_choice"])
        return Response(UserPreferencesSerializer(data, context={"request" : request}).data, status=status.HTTP_200_OK)




# from core.pagination import StandardResultsSetPagination
# from apps.accounts.models import User
# from apps.accounts.serialize.user import UserProfileSerializer


# class UserViewSet(viewsets.GenericViewSet,
#                   mixins.RetrieveModelMixin,
#                   mixins.UpdateModelMixin,
#                   mixins.ListModelMixin):
#     """User ViewSet with extended functionality"""
#     queryset = User.objects.all()
#     serializer_class = UserProfileSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#     pagination_class = StandardResultsSetPagination

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context['request'] = self.request
#         return context

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
#     def clubs(self, request, pk=None):
#         """Get user's clubs"""
#         user = self.get_object()
#         return get_user_clubs(request, user.id)

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
#     def posts(self, request, pk=None):
#         """Get user's posts"""
#         user = self.get_object()
#         return get_user_posts(request, user.id)

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
#     def roles(self, request, pk=None):
#         """Get all roles for user across clubs"""
#         user = self.get_object()
#         return get_all_user_roles(request, user.id)

#     @action(detail=True, methods=['GET'], url_path=r'roles/(?P<club_id>\d+)')
#     def club_roles(self, request, pk=None, club_id=None):
#         """Get user's roles in a specific club"""
#         user = self.get_object()
#         return get_user_roles_in_club(request, user.id, club_id)
