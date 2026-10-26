from rest_framework import serializers
from rest_framework.response import Response


from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework import permissions, response, status

from core import pagination
from core.policies.utils import current_user
from apps.clubs.models import Club, Membership, Visibility, ClubStatus
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.serializer.membership.m_serializers import MembershipSerializer
from apps.clubs.serializer.role_serializers import RoleSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_roles(request: Request, pk: str) -> Response:
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

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_role(request: Request, pk: str) -> Response:
    """
    Create a new role in a club
    """
    club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)
    svc = ClubService(request)

    membership = svc.membership_repository.get_membership(club, request.user)
    is_owner = club.owner == request.user

    if not (membership.has_permission('manage_roles') or is_owner):
        return response.Response(
            {'detail': 'You must have manage_roles permission to create a role.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = RoleSerializer(
        data=request.data,
        context={'request': request}
    )

    if not serializer.is_valid():
        return response.Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    role = serializer.save(club=club)

    return response.Response({
        'club_id': club.id,
        'club_name': club.name,
        'role': serializer.data
    })