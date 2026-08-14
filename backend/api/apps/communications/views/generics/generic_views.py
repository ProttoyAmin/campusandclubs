from rest_framework.request import Request
from core.policies.utils import current_user
from django.db.models import QuerySet
from apps.communications.serializers.email.email_serializers import SendEmailSerializer, EmailSerializer
from django.core.mail import EmailMessage
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics
from core.views import ServiceMixin

from apps.communications.models import Email, EmailRecipient
from apps.communications.services.email.email_service import EmailService
from rest_framework import permissions
from core.pagination import StandardResultsSetPagination

class SendEmailAPIView(ServiceMixin[EmailService, ], generics.ListCreateAPIView):
    service_class = EmailService
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SendEmailSerializer
        return EmailSerializer

    def get_queryset(self) -> QuerySet[Email]:
        return self.get_service(self.request).list_emails()

    def create(self, request):
        serializer = self.get_serializer_class()(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        email = self.get_service(request).send_club_email(
            sender=request.user,
            receiver=serializer.validated_data["receiver"],
            club_id=serializer.validated_data["club_id"],
            body=serializer.validated_data["body"],
        )

        return Response(
            {"detail": "Email sent successfully."},
            status=status.HTTP_201_CREATED,
        )

    def list(self, request: Request):
        paginated_queryset = self.paginate_queryset(self.get_queryset())
        serializer = self.get_serializer_class()(paginated_queryset, many=True, context={"request": request})
        return self.get_paginated_response(serializer.data)