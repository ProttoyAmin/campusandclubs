from pprint import pprint
from typing import Any
from django.db.models import QuerySet
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics


from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer
from apps.clubs.dtos.club_filters import ClubListFilters
from core.policies.utils import current_user

from apps.accounts.models.user import User
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, MembershipApplication
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializers import DemoSerializer, MembershipSerializer
from apps.clubs.serializer import MembershipApplicationCreateSerializer, ClubJoinSerializer


class ClubJoinView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = ClubJoinSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Club]:
        return self.get_service(self.request).list_clubs(filters=ClubListFilters(), viewer=self.request.user)

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:

        club: Club = self.get_object()
        
        decision = self.get_policy(request, club).can_join()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        if decision.requires_application:
            return Response({
                "detail": decision.reason,
                # "requires_application": True,
                "application_url" : request.build_absolute_uri(reverse("clubs:application", args=[club.pk]))
            }, status=status.HTTP_303_SEE_OTHER)

        membership = self.get_service(request).join_club(
            club, user=current_user(request))
        return Response(ClubJoinSerializer(membership).data, status=status.HTTP_201_CREATED)


class LeaveClubView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        return self.get_service(self.request).get_membership_applications(self.kwargs["pk"])

