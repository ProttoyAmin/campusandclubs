from pprint import pprint
from typing import Any
from django.db.models import QuerySet
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics


from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer
from core.policies.utils import current_user

from apps.accounts.models.user import User
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, MembershipApplication
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializers import DemoSerializer, MembershipSerializer
from apps.clubs.serializer import MembershipApplicationCreateSerializer, ClubJoinSerializer

# COME BACK TO THIS LATER
# TODO: think about moving this view to membership generics

class MA_ListCreateAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.ListCreateAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]



    def get_queryset(self) -> QuerySet[MembershipApplication]:
        return self.get_service(self.request).get_membership_applications(self.kwargs.get("pk"))


    def create(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs.get("pk"))
        decision = self.get_policy(request, club).can_join()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = self.get_service(request).apply_to_club(
            club,
            current_user(request),
            message=serializer.validated_data.get("message"),
        )
        serializer = self.get_serializer(application)
        return Response({
            "detail": "Your application has been submitted.",
            "application": serializer.data,
        }, status=status.HTTP_201_CREATED)


class MA_ApproveAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    queryset = MembershipApplication.objects.all()
    lookup_field = "pk"
    lookup_url_kwarg = "application_pk"
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_service(request).membership_application_repository.get_application(
            club_id=club.pk, application_id=self.kwargs["application_pk"]
        )
        application = self.get_service(request).approve_application(application, current_user(request))

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MA_RejectAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    queryset = MembershipApplication.objects.all()
    lookup_field = "pk"
    lookup_url_kwarg = "application_pk"
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()

        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_service(request).membership_application_repository.get_application(
            club_id=club.pk, application_id=self.kwargs["application_pk"]
        )
        application = self.get_service(request).reject_application(application, current_user(request))

        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MA_WithdrawAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    queryset = MembershipApplication.objects.all()
    lookup_field = "pk"
    lookup_url_kwarg = "application_pk"
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        application = self.get_service(request).membership_application_repository.get_application(
            club_id=club.pk, application_id=self.kwargs["application_pk"]
        )

        decision = self.get_policy(request, club).can_withdraw(application, current_user(request))
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_service(request).withdraw_application(application)
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)


