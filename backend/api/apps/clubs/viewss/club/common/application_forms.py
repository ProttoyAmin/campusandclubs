"""Views for managing a club's application Form (the questionnaire itself)."""
from __future__ import annotations

from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response

from apps.clubs.models import Club, Form
from apps.clubs.policies.club import ClubPolicy
from apps.clubs.serializer.forms import FormSerializer
from apps.clubs.services.club.club_service import ClubService
from core.policies.utils import current_user
from core.views import PolicyMixin, ServiceMixin


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
    serializer_class = FormSerializer

    def get(self, request: Request, pk) -> Response:
        club = generics.get_object_or_404(Club, pk=pk)
        view_decision = self.get_policy(request, club).can_view()
        if not view_decision.allowed:
            return Response({"detail": view_decision.reason}, status=status.HTTP_403_FORBIDDEN)

        form = self.get_service(request).get_club_form(club)
        if form is None:
            return Response({"form": None}, status=status.HTTP_200_OK)
        return Response(
            FormSerializer(form, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request, pk) -> Response:
        club = generics.get_object_or_404(Club, pk=pk)
        serializer = FormSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        form = self.get_service(request).set_club_form(
            club,
            title=serializer.validated_data.get("title", ""),
            questions=serializer.validated_data.get("questions", []),
            created_by=current_user(request),
        )
        return Response(
            FormSerializer(form, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
