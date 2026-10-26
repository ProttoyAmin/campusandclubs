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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def member_detail(request: Request, pk: str, user_id: str) -> Response:
    """
    Get detailed information about a specific member
    """
    # from apps.clubs.models import ClubStatus, Club,  Membership, Visibility
    from apps.accounts.models import User
    from apps.clubs.repositories import MembershipRepository

    repo = MembershipRepository()
    club = get_object_or_404(Club, pk=pk, status=ClubStatus.ACTIVE)
    user = get_object_or_404(User, pk=user_id)

    # Check if user can view member details
    # is_member = Membership.objects.filter(
    #     user=request.user, club=club).exists()

    is_member = repo.membership_exists(club=club, user=user)

    is_owner = club.owner == request.user
    is_target_member = repo.membership_exists(club=club, user=user)

    if not is_target_member:
        return response.Response(
            {'detail': 'User is not a member of this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if club.privacy != Visibility.PUBLIC and not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to view member details.'},
            status=status.HTTP_403_FORBIDDEN
        )

    membership = repo.get_membership(user=user, club=club)

    # Membership.objects.filter(
    #     user=user, club=club
    # ).select_related('user').first()

    # Get user's activity in club (posts, comments, etc.)
    from apps.posts.models import Post

    post_count = Post.objects.filter(
        author=user,
        club=club,
        deleted_at__isnull=True
    ).count()

    # Get role permissions combined from all roles
    role_permissions = membership.user_permissions()

    return response.Response({
        'club': {
            'id': str(club.id),
            'name': club.name,
            'slug': club.slug
        },
        'member': MembershipSerializer(membership).data,
        'post_count': post_count,
        'roles': [
            {
                'id': str(role.id),
                'name': role.name,
                'color': role.color
            } for role in membership.roles.all()
        ],
        'permissions': role_permissions,
        'is_owner': club.owner == user,
        # Will be populated based on requester's permissions
        'can_manage': (membership.has_permission('manage_club'))
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_members(request: Request, pk: str) -> response.Response:
    """
    Search members within a club
    """
    club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)

    if not club: return Response(
        {'detail': 'Club not found.'},
        status=status.HTTP_404_NOT_FOUND
    )

    # Check if user can view members
    is_member = Membership.objects.filter(
        user=request.user, club=club).exists()
    is_owner = club.owner == request.user

    if not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to search members.'},
            status=status.HTTP_403_FORBIDDEN
        )

    query = request.query_params.get('q', '')

    if not query:
        return response.Response(
            {'detail': 'Empty query.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    memberships = Membership.objects.filter(
        club=club
    ).filter(
        Q(user__username__icontains=query) |
        Q(user__email__icontains=query) |
        Q(user__first_name__icontains=query) |
        Q(user__last_name__icontains=query)
    ).select_related('user', 'club').order_by('user__username')

    serializer = MembershipSerializer(
        memberships,
        many=True,
        context={'request': request}
    )

    return response.Response({
        'club_id': club.id,
        'club_name': club.name,
        'query': query,
        'total_results': memberships.count(),
        'members': serializer.data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_club_permissions(request: Request, pk: str):
    """
    Get all permissions available for the club
    """
    from apps.clubs.models.permission import ClubPermission
    from django.shortcuts import get_object_or_404


    permissions = ClubPermission.objects.all().order_by('codename')

    club = get_object_or_404(Club, pk=pk, deleted_at__isnull=True)

    is_member = Membership.objects.filter(
        user=request.user, club=club
    ).exists()
    is_owner = club.owner == request.user

    if not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to view permissions.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # roles = club.roles.all().order_by('name')
    # serializer = RoleSerializer(
    #     roles,
    #     many=True,
    #     context={'request': request}
    # )

    # # all unique permission keys from all roles
    # all_permissions = sorted(
    #     list(set().union(*(role.permissions.keys() for role in roles))))

    return response.Response({
        'club_id': str(club.id),
        'club_name': club.name,
        'total_permissions': permissions.count(),
        # 'all_permissions': all_permissions,
        'permissions': [p.codename for p in permissions]
    })