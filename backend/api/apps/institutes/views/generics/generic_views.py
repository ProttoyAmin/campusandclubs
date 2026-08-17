from core.pagination import StandardResultsSetPagination
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

from drf_spectacular.utils import extend_schema_view

from apps.institutes.schema import (
    claim_affiliation_schema,
    verify_affiliation_schema,
    list_affiliations_schema,
    create_affiliation_schema,
    retrieve_affiliation_schema,
    update_affiliation_schema,
    partial_update_affiliation_schema,
    destroy_affiliation_schema,
)


class InstituteListCreateView(
    ServiceMixin[InstituteService],
    generics.ListCreateAPIView
):
    service_class = InstituteService
    serializer_class = InstituteSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[Institute]:
        return self.get_service(self.request).list_institutes()

    def list(self, request: Request) -> Response:

        requested_fields = request.query_params.get('fields')

        field_list = None

        if requested_fields:
            field_list = [field.strip()
                          for field in requested_fields.split(',')]
            if 'id' not in field_list:
                field_list.append('id')

        institutes = self.get_queryset()
        serializer = self.get_serializer(institutes, many=True, context={
                                         'request': request, 'fields': field_list})

        paginated_response = self.paginate_queryset(institutes)
        if paginated_response is not None:
            serializer = self.get_serializer(paginated_response, many=True, context={
                'request': request, 'fields': field_list})
            return self.get_paginated_response(serializer.data)
        return Response(paginated_response.data)


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


@claim_affiliation_schema
class AffiliateClaimView(ServiceMixin[AffiliateService], generics.GenericAPIView):
    """
    Validate user type and institute.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ClaimAffiliateSerializer
    service_class = AffiliateService

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()

    def post(self, request: Request) -> Response:
        affiliate_service = self.get_service(self.request)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

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


@extend_schema_view(
    get=list_affiliations_schema,
    post=create_affiliation_schema,
)
class AffiliationStatusView(ServiceMixin[AffiliateService], generics.ListCreateAPIView):
    service_class = AffiliateService
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()

    def get_serializer_class(self):
        return InstituteAffiliateSerializer


@extend_schema_view(
    retrieve=retrieve_affiliation_schema,
    update=update_affiliation_schema,
    partial_update=partial_update_affiliation_schema,
    destroy=destroy_affiliation_schema,
)
class AffiliationRetreiveUpdateDeleteView(ServiceMixin[AffiliateService], generics.RetrieveUpdateAPIView):
    service_class = AffiliateService
    serializer_class = InstituteAffiliateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'pk'

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return self.get_service(self.request).list()


@verify_affiliation_schema
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
