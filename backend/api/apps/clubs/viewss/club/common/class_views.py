from apps.clubs.models import Membership
from typing import Any
from django.db.models import QuerySet
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics

from apps.clubs.dtos.club_filters import ClubListFilters
from core.policies.utils import current_user

from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializer import  ClubJoinSerializer
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