from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework import permissions, response, status

from core import pagination
from core.policies.utils import current_user
from apps.clubs.models import Club, Membership, Visibility, ClubStatus
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.serializer.membership.m_serializers import MembershipSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_members(request: Request, pk) -> response.Response:
    """List all members of a club with filtering options.

    Query params:
    - role: Filter by role name
    - search: Search members by username / email / first / last name
    - sort: joined_at (default), username, role
    - order: asc / desc (default)
    """
    club = get_object_or_404(Club, pk=pk, status=ClubStatus.ACTIVE)

    is_member = Membership.objects.filter(
        user=request.user, club=club).exists()
    is_owner = club.owner == request.user

    if club.privacy != Visibility.PUBLIC and not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to view members.'},
            status=status.HTTP_403_FORBIDDEN
        )

    service = ClubService(actor=current_user(request))
    memberships = service.list_members(
        club,
        role_name=request.query_params.get("role"),
        search=request.query_params.get("search"),
        sort_by=request.query_params.get("sort", "joined_at"),
        order=request.query_params.get("order", "desc"),
    )

    paginator = pagination.StandardResultsSetPagination()
    paginated_memberships = paginator.paginate_queryset(memberships, request)

    serializer = MembershipSerializer(
        paginated_memberships,
        many=True,
        context={'request': request}
    )

    return paginator.get_paginated_response({
        'club_id': str(club.id),
        'club_name': club.name,
        'total_members': memberships.count(),
        'is_member': is_member,
        'is_owner': is_owner,
        'members': serializer.data
    })
