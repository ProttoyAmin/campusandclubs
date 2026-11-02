from apps.clubs.services.role_service import RoleService
from core.views import ServiceMixin
from apps.clubs.policies.club import ClubPolicy
from django.db.models import QuerySet
from apps.clubs.serializers import RoleCreateUpdateSerializer
from rest_framework import serializers
from rest_framework.response import Response


from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework import permissions, response, status

from core import pagination
from core.policies.utils import current_user
from apps.clubs.models import Club, Membership, Visibility, ClubStatus, Role
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.serializer.membership.m_serializers import MembershipSerializer
from apps.clubs.serializer.role_serializers import RoleSerializer, RoleAssignSerializer
from core.views import PolicyMixin


class ListCreateRoleAPIView(generics.ListCreateAPIView, PolicyMixin[ClubPolicy, Club], ServiceMixin[RoleService]):
    policy_class = ClubPolicy
    service_class = RoleService
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RoleCreateUpdateSerializer
        return RoleSerializer

    def get_queryset(self) -> QuerySet[Role]:
        return self.get_service(self.request).list_roles(club_pk=self.kwargs['pk'])

    def list(self, request: Request, pk: str) -> Response:
        """
        List all roles in a club
        """
        club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)

        # Check if user is a member
        is_member = Membership.objects.filter(
            user=request.user, club=club).exists()
        is_owner = club.owner == request.user

        if not (is_member or is_owner):
            return response.Response(
                {'detail': 'You must be a club member to view roles.'},
                status=status.HTTP_403_FORBIDDEN
            )

        roles = club.roles.all().order_by('name')

        # Filter by user_id if provided
        user_id = request.query_params.get('user_id')
        if user_id:
            # Get roles assigned to specific user
            user_roles = []
            for role in roles:
                if role.users.filter(id=user_id).exists():
                    user_roles.append(role)
            roles = user_roles

        serializer = RoleSerializer(
            roles,
            many=True,
            context={'request': request}
        )

        return response.Response({
            'club_id': club.id,
            'club_name': club.name,
            'total_roles': roles.count(),
            'roles': serializer.data
        })



    def create(self, request: Request, pk: str) -> Response:
        """
        Create a new role in a club
        """
        club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)
        svc = self.get_service(request)

        membership = self.get_service(request).membership_repo.get_membership(club, request.user)

        if not membership: return Response({'detail': 'Not a member.'}, status=status.HTTP_403_FORBIDDEN) 
        is_owner = club.owner == request.user

        if not (membership.has_permission('manage_roles') or is_owner):
            return response.Response(
                {'detail': 'You must have manage_roles permission to create a role.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return response.Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        role  = svc.role_repository.create(name=data['name'], club=club, color=data['color'])
        role.permissions.set(data['permissions'])

        return response.Response({
            'club_id': club.id,
            'club_name': club.name,
            'role': serializer.data
        })


class AssignRoleAPIView(generics.GenericAPIView, ServiceMixin[RoleService]):
    service_class = RoleService
    serializer_class = RoleAssignSerializer

    def get_queryset(self) -> QuerySet[Role]:
        return self.get_service(self.request).list_roles(club_pk=self.kwargs['pk'])

    # def get(self, request: Request, pk: str, role_id: str, *args, **kwargs) -> Response:
    #     club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)
    #     role = get_object_or_404(Role, pk=role_id)

    #     return Response({
    #         'club_id' : club.id,
    #         'role_id' : role.id
    #     })

    def post(self, request: Request, pk: str, role_id: str, *args, **kwargs) -> Response:
        club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)
        role = get_object_or_404(Role, pk=role_id)
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        svc = self.get_service(request).assign_role(serializer.validated_data['member_ids'], role_id)
        return Response(serializer.validated_data)