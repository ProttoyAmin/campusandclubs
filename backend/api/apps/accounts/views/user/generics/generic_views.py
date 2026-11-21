from __future__ import annotations


from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.serializers import BaseSerializer

from apps.accounts.models import User, UserSession
from apps.accounts.serializers.user import (
    UserSerializer,
    UserSessionsSerializer,
    RevokeSessionSerializer
)
from apps.accounts.services.credential_service import CredentialService
from core.policies.utils import current_user
from core.views.base import ServiceMixin

class CompleteUserInfoView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


class RetreieveMeSessions(generics.GenericAPIView, ServiceMixin):
    service_class = CredentialService
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self) -> QuerySet[UserSession]:
        return self.get_service(self.request).list_sessions(self.request._request)
    
    def get_serializer_class(self) -> type[RevokeSessionSerializer] | type[UserSessionsSerializer]:
        if self.request.method == "GET":
            return UserSessionsSerializer
        elif self.request.method == "DELETE":
            return RevokeSessionSerializer
        return UserSessionsSerializer

    def get(self, request: Request):
        serializer = self.get_serializer(self.get_queryset(), many=True, context={"request" : request})
        return Response({"success": True, "data": serializer.data})

    def delete(self, request: Request):
        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        data = self.get_service(request).revoke_session(request=request._request, session_id=serializer.validated_data["id"])
        return Response({"success" : True, "data" : self.get_serializer(data, many=True).data})

class RevokeOtherSessionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSessionsSerializer

    def post(self, request: Request):
        data = CredentialService(actor=current_user(request)).revoke_other_sessions(request._request)
        return Response({"success": True, "data": self.get_serializer(data, many=True).data})