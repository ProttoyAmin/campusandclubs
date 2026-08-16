from apps.institutes.serializers import VerifyAffiliateSerializer
from rest_framework.request import Request
from apps.institutes.models import InstituteAffiliate
from apps.institutes.serializers import ClaimAffiliateSerializer, InstituteAffiliateSerializer
from apps.accounts.policies.user import UserPolicy
from core.views import PolicyMixin
from django.db.models import QuerySet
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.response import Response

from apps.institutes.models import Institute
from apps.institutes.serializers import (
    InstituteSerializer,
    InstituteDetailSerializer
)
from apps.accounts.models import User

from core.views import ServiceMixin
from apps.institutes.services import InstituteService
from apps.institutes.services import AffiliateService


class InstituteListCreateView(
    ServiceMixin[InstituteService],
    generics.ListCreateAPIView
):
    service_class = InstituteService
    serializer_class = InstituteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Institute]:
        return self.get_service(self.request).list_institutes()


class InstituteDetailUpdateDeleteView(
    ServiceMixin[InstituteService],
    generics.RetrieveUpdateDestroyAPIView
):
    service_class = InstituteService
    serializer_class = InstituteDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'pk'

    def get_queryset(self) -> QuerySet[Institute]:
        return self.get_service(self.request).list_institutes()


class AffiliateClaimView(ServiceMixin[AffiliateService], generics.GenericAPIView):
    """
    Validate user type and institute.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClaimAffiliateSerializer
    service_class = AffiliateService

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()

    # def get(self, request: Request) -> Response:
    #     serializer = self.get_serializer()
    #     return Response(serializer.data)

    def post(self, request: Request) -> Response:
        affiliate_service = self.get_service(self.request)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # if request.data:
        #     return Response(request.data)

        user: User = request.user
        validated_data = serializer.validated_data

        academic_profile = affiliate_service.claim(
            validated_data, user.id)
        user.type = academic_profile.member.role
        user.professional_email = academic_profile.academic_email
        user.save(update_fields=["type", "professional_email"])

        return Response({
            "message": "Email sent successfully."
        }, status=status.HTTP_200_OK)


class AffiliationStatusView(ServiceMixin[AffiliateService], generics.ListCreateAPIView):
    service_class = AffiliateService
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()

    def get_serializer_class(self):
        return InstituteAffiliateSerializer


class AffiliationRetreiveUpdateDeleteView(ServiceMixin[AffiliateService], generics.RetrieveUpdateAPIView):
    service_class = AffiliateService
    serializer_class = InstituteAffiliateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'pk'

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()


class VerifyAffiliationView(ServiceMixin[AffiliateService], generics.GenericAPIView):
    service_class = AffiliateService
    serializer_class = VerifyAffiliateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, **kwargs) -> Response:
        affiliate_service = self.get_service(self.request)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        affiliate = affiliate_service.verify_affiliation(
            validated_data['token'])

        return Response({
            "message": f"Your affiliation with {affiliate.institute.name} has been verified successfully."
        }, status=status.HTTP_200_OK)
    # def get(self, request: Request, **kwargs) -> Response:
    #     affiliate_service = self.get_service(self.request)
    #     affiliate_id = kwargs.get('affiliate_id')
    #     affiliate = affiliate_service.get(id=affiliate_id)
    #     return Response(self.get_serializer_class(affiliate).data, status=status.HTTP_200_OK)
