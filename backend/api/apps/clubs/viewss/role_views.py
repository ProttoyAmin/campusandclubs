from apps.clubs.services.role_service import RoleService
from core.mixins import ServiceMixin, PolicyMixin
from apps.clubs.policies.club import ClubPolicy
from django.db.models import QuerySet
from apps.clubs.serializers import RoleCreateUpdateSerializer
from rest_framework import serializers
from rest_framework.response import Response


from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import generics, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework import status
from rest_framework.views import APIView

from core.views.base import current_user
from core import pagination
from core.policies.utils import current_user
from apps.clubs.models import Club, Membership, Visibility, ClubStatus, Role
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.serializer.membership.m_serializers import MembershipSerializer
from apps.clubs.serializer.role_serializers import RoleSerializer, RoleAssignSerializer, RoleDetailSerializer
from core.response.api_response import ApiResponse



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

        policy = self.get_policy(request, club)
        decision = policy.can_view()
        if not decision.allowed:
            return Response(
                {'detail': decision.reason},
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

        return Response({
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

        membership = self.get_service(request).membership_repo.get_membership(club, current_user(request))

        if not membership: return Response({'detail': 'Not a member.'}, status=status.HTTP_403_FORBIDDEN) 
        is_owner = club.owner == request.user

        if not (membership.has_permission('manage_roles') or is_owner):
            return Response(
                {'detail': 'You must have manage_roles permission to create a role.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        role  = svc.role_repository.create(name=data['name'], club=club, color=data['color'])
        role.permissions.set(data['permissions'])

        return Response({
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

class RetreiveRoleAPIView(APIView, ServiceMixin[RoleService], PolicyMixin[ClubPolicy, Club]):
    service_class = RoleService
    serializer_class = RoleDetailSerializer
    policy_class = ClubPolicy

    def get(self, request: Request, pk: str, role_id: str, *args, **kwargs) -> Response:
        role = self.get_service(request).get_role_with_members(role_id=role_id, club_pk=pk)
        policy = self.get_policy(request, role.club)
        decision = policy.can_edit_roles()

        if not decision.allowed:
            return Response(
                {'detail': decision.reason},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.serializer_class(role, context={'request': request})

        return ApiResponse(serializer.data)

    def patch(self, request: Request, pk: str, role_id: str, *args, **kwargs) -> Response:
        role = self.get_service(request).get_role_with_members(role_id=role_id, club_pk=pk)
        policy = self.get_policy(request, role.club)
        decision = policy.can_edit_roles()

        if not decision.allowed:
            return Response(
                {'detail': decision.reason},
                status=status.HTTP_403_FORBIDDEN
            )

        update_serializer = RoleCreateUpdateSerializer(
            role,
            data=request.data,
            partial=True,
            context={'request': request, 'club': role.club}
        )
        update_serializer.is_valid(raise_exception=True)
        updated_role = update_serializer.save()
        detail_serializer = self.serializer_class(
            updated_role,
            context={'request': request}
        )

        return ApiResponse(detail_serializer.data, message='Role updated successfully.')

class RoleMembersAPIView(APIView, ServiceMixin[RoleService], PolicyMixin[ClubPolicy, Club]):
    service_class = RoleService
    serializer_class = MembershipSerializer
    policy_class = ClubPolicy

    def get(self, request: Request, pk: str, role_id: str, *args, **kwargs) -> Response:
        role = self.get_service(request).get_role(role_id=role_id)
        policy = self.get_policy(request, role.club)
        decision = policy.can_edit_roles()

        if not decision.allowed:
            return Response(
                {'detail': decision.reason},
                status=status.HTTP_403_FORBIDDEN
            )

        members = self.get_service(request).get_role_members(club_pk=pk, role_id=role_id)
        serializer = self.serializer_class(members, many=True, context={'request': request})

        return ApiResponse(serializer.data)
