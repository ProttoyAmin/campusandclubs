from apps.clubs.serializer.forms.form_serializers import FormSerializers
from django.contrib.contenttypes.models import ContentType
from apps.clubs.repositories import MembershipRepository
from apps.clubs.models.membership.form.enums import ApplicationStatus
from django.db.models import QuerySet
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics


from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer
from apps.clubs.serializer.membership.form.application import MembershipBulkApproveSerializer
from core.policies.utils import current_user

from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, MembershipApplication
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializer import MembershipApplicationCreateSerializer

# COME BACK TO THIS LATER
# TODO: think about moving this view to membership generics

class MA_ListCreateAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.ListAPIView
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


class MA_RetreiveAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.RetrieveAPIView
):
    policy_class = ClubPolicy
    service_class = ClubService
    queryset = MembershipApplication.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return MembershipApplicationSerializer

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        return self.get_service(self.request).application_service.get_application(club.id, self.kwargs['application_pk'])

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_review_application()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)
        return super().retrieve(request, *args, **kwargs)


class ApplyForMembershipAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView
):
    """GET  /clubs/<pk>/applications/              -> list (admins only)
    POST /clubs/<pk>/applications/              -> submit application
    GET  /clubs/<pk>/applications/<app_pk>/     -> retrieve one (admins or applicant)
    """

    policy_class = ClubPolicy
    service_class = ClubService
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return MembershipApplicationCreateSerializer

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        return self.get_service(self.request).get_membership_applications(club)

    def get(self, request: Request, *args, **kwargs) -> Response:
        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])
        decision = self.get_policy(request, club).can_join()
        if not decision.allowed:
            return Response({"detail": decision.reason}, status=status.HTTP_403_FORBIDDEN)

        from apps.taxonomy.models import Form

        form = self.get_service(request).form_repository.get_active_form(club)

        if form is None:
            return Response({"form": None}, status=status.HTTP_200_OK)

        return Response({"form": FormSerializers(form, context={
            'request': request
        }).data}, status=status.HTTP_200_OK)

    def post(self, request: Request, *args, **kwargs) -> Response:
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


class MA_ApproveAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView[MembershipApplication]):
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


class MA_BulkApproveAPIView(
    ServiceMixin[ClubService],
    generics.GenericAPIView,
):
    permission_classes = [permissions.IsAuthenticated]
    queryset = MembershipApplication.objects.all()
    service_class = ClubService
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MembershipBulkApproveSerializer
        return MembershipApplicationSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])

        if request.user.id != club.owner.id:
            return Response({"detail": "Only club owners can approve or reject applications"}, status=status.HTTP_403_FORBIDDEN)

        applications = club.applications.filter(id__in=serializer.validated_data["application_ids"])

        if not applications.exists():
            return Response({"detail": "No applications found."}, status=status.HTTP_404_NOT_FOUND)

        svc = self.get_service(request)

        memberships = []
        for application in applications:
            m = svc.approve_application(application, request.user)
            memberships.append(m)
        
        return Response({
            "detail": f"Successfully approved {len(memberships)} applications.",
            "updated_count": len(memberships)
        }, status=status.HTTP_200_OK)


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


class MA_BulkRejectAPIView(
    generics.GenericAPIView,
):
    permission_classes = [permissions.IsAuthenticated]
    queryset = MembershipApplication.objects.all()
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MembershipBulkApproveSerializer
        return MembershipApplicationSerializer

    def post(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        club = generics.get_object_or_404(Club, pk=self.kwargs["pk"])

        if request.user.id != club.owner.id:
            return Response({"detail": "Only club owners can approve or reject applications"}, status=status.HTTP_403_FORBIDDEN)

        applications = club.applications.filter(id__in=serializer.validated_data["application_ids"])

        if not applications.exists():
            return Response({"detail": "No applications found."}, status=status.HTTP_404_NOT_FOUND)

        from django.utils import timezone

        now = timezone.now()
        updated_count = applications.update(
            status=ApplicationStatus.REJECTED,
            reviewed_by=request.user,
            reviewed_at=now 
        )
        
        return Response({
            "detail": f"Successfully rejected {updated_count} applications.",
            "updated_count": updated_count
        }, status=status.HTTP_200_OK)

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


class MA_ApplicationResponses(generics.ListCreateAPIView):
    serializer_class = MembershipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "pk"
    lookup_url_kwarg = "application_pk"

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        application = generics.get_object_or_404(MembershipApplication, pk=self.kwargs["application_pk"])
        return MembershipApplication.objects.filter(application=application)

    def list(self, request: Request, *args, **kwargs) -> Response:
        responses = self.get_queryset()
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)