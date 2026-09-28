from django.db.models import QuerySet
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.policies.utils import current_user
from core.views import ServiceMixin
from apps.notifications.models import Notification
from apps.notifications.repositories import NotificationRepository
from apps.notifications.services.notification_service import NotificationService
from core.pagination import StandardResultsSetPagination
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationActorSerializer,
    NotificationListSerializer
)



class NotificationListView(ServiceMixin[NotificationService], generics.ListAPIView):
    permission_classes = [
        IsAuthenticated
    ]
    service_class = NotificationService
    serializer_class = NotificationListSerializer

    def get_queryset(self) -> QuerySet[Notification]:
        return self.get_service(self.request).list()


class UserNotificationListView(ServiceMixin[NotificationService], generics.ListAPIView):
    permission_classes = [
        IsAuthenticated
    ]
    service_class = NotificationService
    serializer_class = NotificationListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self) -> QuerySet[Notification]:
        return self.get_service(self.request).list_user_notifications(user=current_user(self.request))

    def list(self, request: Request):
        serializer = self.get_serializer(self.get_queryset(), many=True, context={'request': request})
        paginated_resopnse = self.paginate_queryset(serializer.data)
        return self.get_paginated_response(paginated_resopnse)
