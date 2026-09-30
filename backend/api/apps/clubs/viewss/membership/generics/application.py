from __future__ import annotations

from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response

from apps.clubs.models import Club, MembershipApplication
from apps.clubs.policies.club import ClubPolicy
from apps.clubs.serializer.membership.form.application import (
    MembershipApplicationCreateSerializer,
    MembershipApplicationSerializer,
)
from apps.clubs.services.club.club_service import ClubService
from core.policies.utils import current_user
from core.views import PolicyMixin, ServiceMixin


class MA_ListCreateAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.ListCreateAPIView
):
    """GET  /clubs/<pk>/applications/              -> list (admins only)
    POST /clubs/<pk>/applications/              -> submit application
    GET  /clubs/<pk>/applications/<app_pk>/     -> retrieve one (admins or applicant)
    """

    policy_class = ClubPolicy
    service_class = ClubService
    permission_classes = [permissions.IsAuthenticated]

    # ---- DRF plumbing ----
    def get_serializer_class(self):
        if self.request.method == "POST":
            return MembershipApplicationCreateSerializer
        return MembershipApplicationSerializer

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        return self.get_service(self.request).get_membership_applications(club)

    # ---- List ----
    def list(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    # ---- Retrieve ----
    def get(self, request: Request, *args, **kwargs) -> Response:
        # /clubs/<pk>/applications/<app_pk>/
        if "application_pk" not in self.kwargs:
            return self.list(request, *args, **kwargs)

        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        application = generics.get_object_or_404(
            self.get_queryset(), pk=self.kwargs["application_pk"]
        )
        # Admins or the applicant themselves can view.
        can_review = self.get_policy(request, club).can_review_application()
        is_applicant = application.applicant_id == current_user(request).id
        if not (can_review.allowed or is_applicant):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            MembershipApplicationSerializer(application, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ---- Create ----
    def create(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs.get("pk"))
        decision = self.get_policy(request, club).can_join()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)
        if not decision.requires_application:
            return Response(
                {"detail": "This club is instant-join; use POST /clubs/<pk>/join/ instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = self.get_service(request).apply_to_club(
            club,
            current_user(request),
            message=serializer.validated_data.get("message"),
            answers=serializer.validated_data.get("answers", []),
        )
        return Response(
            {
                "detail": "Your application has been submitted.",
                "application": MembershipApplicationSerializer(
                    application, context={"request": request}
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MA_ApproveAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView
):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = generics.get_object_or_404(
            MembershipApplication,
            pk=self.kwargs["application_pk"],
            club=club,
        )
        application = self.get_service(request).approve_application(
            application, current_user(request)
        )
        return Response(
            MembershipApplicationSerializer(application, context={"request": request}).data
        )


class MA_RejectAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView
):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = generics.get_object_or_404(
            MembershipApplication,
            pk=self.kwargs["application_pk"],
            club=club,
        )
        application = self.get_service(request).reject_application(
            application, current_user(request)
        )
        return Response(
            MembershipApplicationSerializer(application, context={"request": request}).data
        )


class MA_WithdrawAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView
):
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        application = generics.get_object_or_404(
            MembershipApplication,
            pk=self.kwargs["application_pk"],
            club=club,
        )
        decision = self.get_policy(request, club).can_withdraw(
            application, current_user(request)
        )
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_service(request).withdraw_application(application)
        return Response(
            MembershipApplicationSerializer(application, context={"request": request}).data
        )
