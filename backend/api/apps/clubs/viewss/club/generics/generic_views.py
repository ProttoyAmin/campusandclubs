from django.core.exceptions import PermissionDenied
from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from typing import Any

from core.pagination import StandardResultsSetPagination
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.serializer import ClubDetailSerializer, ClubSerializer
from apps.clubs.models import Club
from apps.clubs.schema import club_list_schema
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.dtos import ClubListFilters
from core.policies.utils import current_user
from apps.clubs.policies.club import ClubPolicy


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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self) -> type[ClubDetailSerializer] | type[ClubSerializer]:
        if self.request.method == "POST":
            return ClubDetailSerializer
        else:
            return ClubSerializer

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=self.request.user)

    @club_list_schema
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        filters = ClubListFilters(
            joined=request.query_params.get("joined", "").lower() == "true",
            search=request.query_params.get("search"),
            privacy=request.query_params.get("privacy"),
            origin=request.query_params.get("origin"),
        )

        clubs = self.get_service(request).list_clubs(
            viewer=request.user, filters=filters)

        page = self.paginate_queryset(clubs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = ClubSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = self.get_service(request)
        club = service.create_club(owner=current_user(
            request), **serializer.validated_data)
        club = service.get_club_detail(club.pk, viewer=current_user(request))

        detail_serializer = self.get_serializer(
            club, context={"request": request})
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class ClubRetrieveUpdateDestroyAPIView(
    ServiceMixin[ClubService],
    PolicyMixin[ClubPolicy, Club],
    generics.RetrieveUpdateDestroyAPIView[Club]
):
    """
        Retrieve, update or delete a club instance.
        """
    serializer_class = ClubDetailSerializer
    service_class = ClubService
    policy_class = ClubPolicy
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=self.request.user)

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_view()

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

        return super().update(request, *args, **kwargs)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        policy = self.get_policy(request, self.get_object())
        if not policy:
            ...

        decision = policy.can_delete()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
