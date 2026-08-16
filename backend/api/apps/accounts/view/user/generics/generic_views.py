from django.db.models import QuerySet
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.request import Request

from apps.accounts.models import User
from apps.accounts.serialize.user import (
    UserSerializer
)
from apps.accounts.services.user_service import AccountService
from apps.accounts.policies.user import UserPolicy
from core.views import PolicyMixin, ServiceMixin


class CompleteUserInfoView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'
