from pprint import pprint
from typing import Any
from django.db.models import QuerySet
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import permissions, status, generics


from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer
from apps.clubs.dtos.club_filters import ClubListFilters
from core.policies.utils import current_user

from apps.accounts.models.user import User
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, MembershipApplication, Form, FormQuestion
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializers import DemoSerializer
from apps.clubs.serializer.forms import FormSerializers, QuestionSerializers




class AF_ListCreateAPIView(generics.ListCreateAPIView):
    """
    GET - Get all application forms
    POST - Create a new application form
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FormSerializers
    queryset = Form.objects.all()

    