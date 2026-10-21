from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
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
from apps.clubs.serializer.forms import FormSerializers, QuestionSerializers, FormCreateSerializer, FormRetrieveSerializer




class AF_ListCreateAPIView(
    ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.GenericAPIView
):
    """GET  /clubs/<pk>/application-forms/ -> active form (with questions) or null.
    POST /clubs/<pk>/application-forms/ -> create/replace the active form.

    Only club admins (owner / manage:members) can POST; any authenticated
    user who can see the club can GET (the frontend needs the questions
    before rendering the apply dialog).
    """

    permission_classes = [permissions.IsAuthenticated]
    policy_class = ClubPolicy
    service_class = ClubService
    serializer_class = FormSerializers
    queryset = Form.objects.all()

    def get(self, request: Request, pk) -> Response:
        club = generics.get_object_or_404(Club, pk=pk)
        # view_decision = self.get_policy(request, club).can_view()
        # if not view_decision.allowed:
        #     return Response({"detail": view_decision.reason}, status=status.HTTP_403_FORBIDDEN)

        form = self.get_service(request).get_club_form(club)
        if form is None:
            return Response(status=status.HTTP_200_OK)
        return Response(
            FormSerializers(form, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request, pk) -> Response:
        club = generics.get_object_or_404(Club, pk=pk)
        serializer = FormSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)

        form = self.get_service(request).set_club_form(
            club,
            title=serializer.validated_data.get("title", ""),
            questions=serializer.validated_data.get("questions", []),
            created_by=current_user(request),
        )
        return Response(
            FormSerializers(form, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
        

class AF_RetrieveAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.RetrieveAPIView[Form], generics.CreateAPIView[Form]):
    """
    GET - Get a specific application form
    data = {
        "questions": [
            {
                "question": "What is your name?",
                "type": "text",
                "required": True
            }
        ],
        "title": "Membership Application Form"
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    policy_class = ClubPolicy
    lookup_field = "pk"
    lookup_url_kwarg = "form_pk"
    serializer_class = FormSerializers
    queryset = Form.objects.all().prefetch_related("questions")

    def get_serializer_class(self) -> type[serializers.Serializer]:
        if self.request.method == "GET":
            return FormRetrieveSerializer
        return MembershipApplicationSerializer
    
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        form = self.get_object()

        serializer = self.get_serializer(form)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response({"data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        form: Form = self.get_object()
        



        return Response({"data": form}, status=status.HTTP_201_CREATED)