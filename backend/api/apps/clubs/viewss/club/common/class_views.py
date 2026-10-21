from apps.clubs.models import Membership
from typing import Any
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics

from apps.clubs.dtos.club_filters import ClubListFilters
from core.policies.utils import current_user

from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, ClubStatus
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializer import (
    ClubJoinSerializer,
    ClubAvatarUploadSerializer,
    ClubBannerUploadSerializer,
)
from apps.clubs.serializer.membership.m_serializers import MembershipSerializer


class ClubJoinView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.CreateAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = ClubJoinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=current_user(self.request))

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:

        club: Club = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        decision = self.get_policy(request, club).can_join()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        if decision.requires_application:
            return Response({
                "detail": decision.reason,
                "application_url" : request.build_absolute_uri(reverse("clubs:application", args=[club.pk]))
            }, status=status.HTTP_303_SEE_OTHER)


        membership = self.get_service(request).join_club(
            club, user=current_user(request))
        return Response(ClubJoinSerializer(membership).data, status=status.HTTP_201_CREATED)


class LeaveClubView(ServiceMixin[ClubService], generics.DestroyAPIView):
    service_class = ClubService
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=current_user(self.request))

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        self.get_service(request).leave_club(
            club=self.get_object(),
            actor=current_user(request),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClubMediaUploadView(ServiceMixin[ClubService], APIView):
    """Upload / update / delete a club's avatar or banner.

    POST/PATCH  → upload file under `avatar` or `banner`
    DELETE      → clear the field (kind chosen via `?type=avatar|banner`)
    """
    service_class = ClubService
    permission_classes = [permissions.IsAuthenticated]

    def _check_permission(self, request, club: Club) -> bool:
        """Owner or any member with `manage:settings` may manage media."""
        if club.owner == request.user:
            return True
        membership = Membership.objects.filter(
            user=request.user, club=club
        ).prefetch_related("roles").first()
        return bool(membership and membership.has_permission("can_manage_settings"))

    def _save_media(self, request, club: Club, file, kind: str) -> Response:
        service = self.get_service(request)
        service.upload_media(club, file, kind)
        from django.conf import settings
        url = club.avatar if kind == "avatar" else club.banner
        return Response(
            {
                "detail": f"{'Avatar' if kind == 'avatar' else 'Banner'} updated successfully.",
                "url": f"{settings.MEDIA_URL}{url}" if url and not url.startswith(settings.MEDIA_URL) else url,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request, pk):
        return self._upload(request, pk)

    def patch(self, request: Request, pk):
        return self._upload(request, pk)

    def _upload(self, request: Request, pk):
        club = get_object_or_404(Club, pk=pk, status=ClubStatus.ACTIVE)

        if not self._check_permission(request, club):
            return Response(
                {"detail": "You do not have permission to update club media."},
                status=status.HTTP_403_FORBIDDEN,
            )

        is_avatar = request.FILES.get("avatar")
        is_banner = request.FILES.get("banner")

        if not (is_avatar or is_banner):
            return Response(
                {"detail": 'Please provide either "avatar" or "banner" file.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        kind = "avatar" if is_avatar else "banner"
        serializer_cls = ClubAvatarUploadSerializer if kind == "avatar" else ClubBannerUploadSerializer
        serializer = serializer_cls(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES.get(kind)
        return self._save_media(request, club, file, kind)

    def delete(self, request: Request, pk):
        club = get_object_or_404(Club, pk=pk, status=ClubStatus.ACTIVE)

        if not self._check_permission(request, club):
            return Response(
                {"detail": "You do not have permission to delete club media."},
                status=status.HTTP_403_FORBIDDEN,
            )

        media_type = request.query_params.get("type")
        if media_type not in ["avatar", "banner"]:
            return Response(
                {"detail": 'Please provide "type" parameter as "avatar" or "banner".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.get_service(request).clear_media(club, media_type)
        return Response(
            {"detail": f"{media_type.capitalize()} deleted successfully."},
            status=status.HTTP_200_OK,
        )
