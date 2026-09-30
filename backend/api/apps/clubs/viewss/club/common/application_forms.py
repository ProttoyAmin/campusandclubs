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


from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer, MembershipApplicationResponseSerializer
from apps.clubs.dtos.club_filters import ClubListFilters
from core.policies.utils import current_user

from apps.accounts.models.user import User
from core.views import PolicyMixin, ServiceMixin
from apps.clubs.models import Club, MembershipApplication, Form, FormQuestion
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.policies.club import ClubPolicy

from apps.clubs.serializers import DemoSerializer
from apps.clubs.serializer.forms import FormSerializers, QuestionSerializers, FormCreateSerializer, FormRetrieveSerializer




class AF_ListCreateAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.ListCreateAPIView[Form]):
    """
    GET - Get all application forms
    POST - Create a new application form
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
    serializer_class = FormSerializers
    queryset = Form.objects.all()

    def get_serializer_class(self) -> type[serializers.Serializer]:
        if self.request.method == "POST":
            return FormCreateSerializer
        return FormSerializers

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List all application forms for a specific club.
        """
        club_pk = self.kwargs["pk"]
        club = Club.objects.filter(pk=club_pk)

        if not club.exists():
            return Response({"data": "Club not found"}, status=status.HTTP_404_NOT_FOUND)
            
        club = club.first()
        policy = self.get_policy(request, club)

        if not policy.can_view().allowed:
            return Response({"data": policy.can_view().reason}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(self.get_queryset().filter(object_id=club.id, content_type=ContentType.objects.get(app_label="clubs", model="club")), many=True)
        
        if serializer.data:
            return Response(
                {
                    'data' : serializer.data,
                    'message' : "Application forms listed successfully"
                } , status=status.HTTP_200_OK
            )

        return Response(
            {
                'data' : [],
                'message' : "No application forms found"
            } , status=status.HTTP_200_OK
        )
    
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            club_pk = self.kwargs["pk"]

            club = Club.objects.filter(pk=club_pk)

            if not club.exists():
                return Response({"data": "Club not found"}, status=status.HTTP_404_NOT_FOUND)
                
            club = club.first()

            policy = self.get_policy(request, club)

            if not policy.can_create_application().allowed:
                return Response({"data": policy.can_create_application().reason}, status=status.HTTP_403_FORBIDDEN)

            form = Form.objects.create(
                title=serializer.validated_data["title"],
                content_type=ContentType.objects.get(app_label="clubs", model="club"),
                object_id=club.id,
                created_by=current_user(request)
            )
            questions = []
            for idx, question in enumerate(serializer.validated_data["questions"]):
                questions.append(FormQuestion(
                    form=form,
                    question=question["question"],
                    type=question["type"],
                    required=question["required"],
                    order=idx+1
                ))
            FormQuestion.objects.bulk_create(questions)
            return Response({"data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

class AF_RetrieveAPIView(ServiceMixin[ClubService], PolicyMixin[ClubPolicy, Club], generics.RetrieveAPIView[Form], generics.CreateAPIView):
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
        return MembershipApplicationResponseSerializer
    
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        form = self.get_object()

        serializer = self.get_serializer(form)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)