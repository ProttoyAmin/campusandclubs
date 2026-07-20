from django.db.models import QuerySet
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.response import Response

from apps.institutes.models import Institute
from apps.institutes.serializers import (
    InstituteSerializer,
    InstituteDetailSerializer
)

from core.views import ServiceMixin
from apps.institutes.services import InstituteService


class InstituteListCreateView(
    ServiceMixin[InstituteService],
    generics.ListCreateAPIView
):
    service_class = InstituteService
    serializer_class = InstituteSerializer

    def get_queryset(self) -> QuerySet[Institute]:
        return self.get_service(self.request).list_institutes()

class InstituteDetailUpdateDeleteView(
    ServiceMixin[InstituteService],
    generics.RetrieveUpdateDestroyAPIView
):
    service_class = InstituteService
    serializer_class = InstituteDetailSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'pk'

    def get_queryset(self) -> QuerySet[Institute]:
        return self.get_service(self.request).list_institutes()
