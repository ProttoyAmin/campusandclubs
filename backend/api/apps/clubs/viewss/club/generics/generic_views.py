from apps.clubs.dtos.club_create import ClubPrivacyJoinModeDTO
from rest_framework.viewsets import GenericViewSet
from apps.clubs.serializer.club.club_details import ClubScopeUpdateSerializer
from apps.clubs.models import JoinMode
from apps.clubs.models import Visibility
from apps.clubs.serializer import ClubPrivacyJoinModeUpdateSerializer
from apps.clubs.dtos.club_create import ClubUpdateSettingsDTO
from apps.clubs.dtos.club_create import ClubCreateDTO
from rest_framework import serializers
from rest_framework.decorators import action
from apps.clubs.serializer import ClubUpdateSerializer
from django.core.exceptions import PermissionDenied
from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from typing import Any

from core.pagination import StandardResultsSetPagination
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models.club.department_templates import DepartmentTemplate
from apps.clubs.serializer import ClubDetailSerializer, ClubSerializer, ClubCreateSerializer
from apps.clubs.models import Club
from apps.clubs.schema import club_list_schema
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.dtos import ClubListFilters
from core.policies.utils import current_user
from apps.clubs.policies.club import ClubPolicy
from core.views import PrivateResponseMixin
from apps.clubs.serializer.club.club import ClubPrivateSerializer, DepartmentTemplateSerializer


class DepartmentTemplateListView(generics.ListAPIView):
    queryset = DepartmentTemplate.objects.all()
    serializer_class = DepartmentTemplateSerializer


# Club List & Create Generic View
class ClubListCreateView(
    ServiceMixin[ClubService],
    generics.ListCreateAPIView[Club]
):

    """
        List & create clubs visible to the authenticated user:
        - All public clubs
        - Closed/Secret clubs only if user is a member

        Query params:
        - search: Filter by name or origin
        - privacy: Filter by privacy type (public/closed/secret)
        - origin: Filter by specific origin
        - joined: Set to 'true' to only show clubs user is member of
        """
    # serializer_class = ClubSerializer
    service_class = ClubService
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self) -> type[ClubCreateSerializer] | type[ClubSerializer]:
        if self.request.method == "POST":
            return ClubCreateSerializer
        else:
            return ClubSerializer

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).exclude_secret_clubs()

    def get_permissions(self) -> list[permissions.BasePermission]:
        if self.request.method == "POST":
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    @club_list_schema
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        filters = ClubListFilters(
            joined=request.query_params.get("joined", "").lower() == "true",
            search=request.query_params.get("search"),
            privacy=request.query_params.get("privacy"),
            origin=request.query_params.get("origin"),
        )

        # clubs = self.get_service(request).list_clubs(
        #     viewer=current_user(request), filters=filters)
        clubs = self.get_service(request).exclude_secret_clubs()

        page = self.paginate_queryset(clubs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def create(self, request: Request, *args, **kwargs) -> Response:
        from apps.clubs.dtos.club_create import ClubCreateDTO

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = self.get_service(request)
        club = service.create_club(owner=current_user(
            request), dto=ClubCreateDTO.from_validated_data(serializer.validated_data))
        club = service.get_club_detail(club.pk, viewer=current_user(request))

        detail_serializer = self.get_serializer(
            club, context={"request": request})
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class ClubRetrieveUpdateDestroyAPIView(
    ServiceMixin[ClubService],
    PrivateResponseMixin[Club],
    PolicyMixin[ClubPolicy, Club],
    generics.RetrieveUpdateDestroyAPIView[Club]
):
    """
        Retrieve, update or delete a club instance.
        """
    serializer_class = ClubDetailSerializer
    private_detail_message = "This club is private"
    private_serializer_class = ClubPrivateSerializer
    service_class = ClubService
    policy_class = ClubPolicy
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=current_user(self.request))

    def get_serializer_class(self) -> type[serializers]:
        if self.request.method == "PUT" or self.request.method == "PATCH":
            return ClubUpdateSerializer
        else:
            return ClubDetailSerializer

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        from apps.clubs.models import Visibility

        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_view()

        if not decision.allowed and self.get_object().privacy == Visibility.PRIVATE:
            return self.get_private_payload(self.get_object(), request)

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        return super().retrieve(request, *args, **kwargs)

    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_edit()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = self.get_service(request).update_settings(self.kwargs['pk'], dto=ClubUpdateSettingsDTO.from_validated_data(serializer.validated_data))

        detail_serializer = self.get_serializer(updated, context={"request": request})
        return Response(detail_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_delete()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


class ClubPrivacyJoinModeUpdateView(
    ServiceMixin[ClubService],
    PolicyMixin[ClubPolicy, Club],
    generics.UpdateAPIView[Club]
):
    """
        Update club privacy and join settings.
        """
    serializer_class = ClubPrivacyJoinModeUpdateSerializer
    service_class = ClubService
    policy_class = ClubPolicy
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(viewer=current_user(self.request))


    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_edit()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        self.get_service(request).update_privacy_join_mode(
            self.kwargs['pk'], 
            dto={
                "privacy": request.data.get("privacy"),
                "join_mode": request.data.get("join_mode")
            }
        )   

        return Response(status=status.HTTP_200_OK)


class ClubScopeUpdateView(
    ServiceMixin[ClubService],
    PolicyMixin[ClubPolicy, Club],
    generics.UpdateAPIView[Club]
):
    """
        Update club scope.
        """
    serializer_class = ClubScopeUpdateSerializer
    service_class = ClubService
    policy_class = ClubPolicy
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(viewer=current_user(self.request))


    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_edit()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        self.get_service(request).update_scope(
            self.get_object(), 
            scope=request.data.get("scope")
        )   

        return Response(status=status.HTTP_200_OK)



class ClubSettingsViewset(
    ServiceMixin[ClubService],
    PolicyMixin[ClubPolicy, Club],
    GenericViewSet
):
    service_class = ClubService
    policy_class = ClubPolicy
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(viewer=current_user(self.request))

    def _authorize_edit(self) -> Club | Response:
        club = self.get_object()
        policy = self.get_policy(self.request, club)

        if not policy:
            return Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        decision = policy.can_edit()

        if not decision.allowed:
            return Response(
                {"detail": decision.reason},
                status=status.HTTP_403_FORBIDDEN,
            )

        return club

    @action(
        detail=False,
        methods=["patch"],
        url_path="privacy-join-mode",
        serializer_class=ClubPrivacyJoinModeUpdateSerializer,
    )
    def update_privacy_join_mode(self, request: Request, pk=None) -> Response:
        club = self._authorize_edit()

        if isinstance(club, Response):
            return club

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        dto = ClubPrivacyJoinModeDTO(
            privacy=serializer.validated_data['privacy'],
            join_mode=serializer.validated_data['join_mode']
        )

        self.get_service(request).update_privacy_join_mode(
            club,
            dto=dto
        )

        return Response(status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["patch"],
        url_path="scope",
        serializer_class=ClubScopeUpdateSerializer,
    )
    def update_scope(self, request: Request, pk=None) -> Response:
        club = self._authorize_edit()

        if isinstance(club, Response):
            return club

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scope = serializer.validated_data['scope']

        self.get_service(request).update_scope(
            club,
            scope=scope
        )

        return Response(status=status.HTTP_200_OK)