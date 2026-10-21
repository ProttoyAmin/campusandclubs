# views.py
# Role & permission management views for clubs.
# All other club views (CRUD, joins, posts, search, stats, media, etc.)
# live under apps.clubs.viewss in either club/ or membership/ subpackages
# and follow the views → service → policy/repo flow.
from rest_framework import permissions, response, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.views import APIView

from django.db.models import Count, Prefetch

from . import models, serializers, permissions as club_permissions
from apps.accounts.models import User


class SuperuserOnlyStrictTestView(APIView):
    permission_classes = [permissions.IsAuthenticated,
                          club_permissions.IsSuperUserOnly]

    def get(self, request: Request):
        return response.Response({
            "status": "Success",
            "message": f"Welcome, **STRICT SUPERUSER** {request.user.username}! Staff users are denied."
        })


# ---------------------------------------------------------------------------
# Role listing / creation
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_club_roles(request, pk):
    """List all roles in a club"""
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)

    # Check if user is member
    if not club.members.filter(id=request.user.id).exists():
        return response.Response(
            {'detail': 'You must be a member to view club roles.'},
            status=status.HTTP_403_FORBIDDEN
        )

    roles = club.roles.all().order_by('name')

    serializer = serializers.RoleSerializer(
        roles, many=True, context={'request': request}
    )

    return response.Response({
        'club_id': club.id,
        'club_name': club.name,
        'roles': serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_club_role(request, pk):
    """Create a new role in a club"""
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)

    # Check if user has permission to manage roles
    membership = models.Membership.objects.filter(
        user=request.user, club=club
    ).prefetch_related('roles').first()

    if not membership or not membership.has_permission('can_manage_members'):
        return response.Response(
            {'detail': 'You do not have permission to create roles in this club.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = serializers.RoleCreateUpdateSerializer(
        data=request.data,
        context={'club': club, 'request': request}
    )

    if not serializer.is_valid():
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    role = serializer.save(club=club)

    return response.Response(
        serializers.RoleSerializer(role, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------------------------------------------
# Role assignment helpers (add / remove / set primary)
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_role_to_member(request, pk, user_id):
    """
    Add a role to a member (without removing existing roles)
    """
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)
    user = get_object_or_404(User, pk=user_id)

    # Check permissions
    is_owner = club.owner == request.user

    if not is_owner:
        requester_membership = models.Membership.objects.filter(
            user=request.user, club=club
        ).first()

        if not requester_membership or not requester_membership.has_permission('can_manage_members'):
            return response.Response(
                {'detail': 'You do not have permission to manage roles.'},
                status=status.HTTP_403_FORBIDDEN
            )

    # Get membership
    try:
        membership = models.Membership.objects.get(user=user, club=club)
    except models.Membership.DoesNotExist:
        return response.Response(
            {'detail': 'User is not a member of this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get role to add
    role_id = request.data.get('role_id')
    role_name = request.data.get('role_name')

    if not role_id and not role_name:
        return response.Response(
            {'detail': 'Provide either role_id or role_name.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get role
    try:
        if role_id:
            role = models.Role.objects.get(id=role_id, club=club)
        else:
            role = models.Role.objects.get(club=club, name__iexact=role_name)
    except models.Role.DoesNotExist:
        return response.Response(
            {'detail': 'Role not found in this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if user already has this role
    if membership.roles.filter(id=role.id).exists():
        return response.Response(
            {'detail': f'User already has the "{role.name}" role.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Add the role
    membership.add_role(role)

    return response.Response({
        'detail': f'Role "{role.name}" added to {user.username}.',
        'user_id': user.id,
        'username': user.username,
        'role_id': role.id,
        'role_name': role.name,
        'current_roles': membership.role_names
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_role_from_member(request, pk, user_id):
    """
    Remove a specific role from a member
    """
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)
    user = get_object_or_404(User, pk=user_id)

    is_owner = club.owner == request.user

    if not is_owner:
        requester_membership = models.Membership.objects.filter(
            user=request.user, club=club
        ).first()

        if not requester_membership or not requester_membership.has_permission('can_manage_members'):
            return response.Response(
                {'detail': 'You do not have permission to manage roles.'},
                status=status.HTTP_403_FORBIDDEN
            )

    # Get membership
    try:
        membership = models.Membership.objects.get(user=user, club=club)
    except models.Membership.DoesNotExist:
        return response.Response(
            {'detail': 'User is not a member of this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get role to remove
    role_id = request.data.get('role_id')
    role_name = request.data.get('role_name')

    if not role_id and not role_name:
        return response.Response(
            {'detail': 'Provide either role_id or role_name.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get role
    try:
        if role_id:
            role = models.Role.objects.get(id=role_id, club=club)
        else:
            role = models.Role.objects.get(club=club, name__iexact=role_name)
    except models.Role.DoesNotExist:
        return response.Response(
            {'detail': 'Role not found in this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if user has this role
    if not membership.roles.filter(id=role.id).exists():
        return response.Response(
            {'detail': f'User does not have the "{role.name}" role.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if this is the last admin role
    if role.has_permission('can_manage_settings'):
        # Count admins by checking all memberships
        admin_count = sum(
            1 for m in models.Membership.objects.filter(club=club).prefetch_related('roles')
            if m.has_permission('can_manage_settings')
        )
        if admin_count <= 1:
            return response.Response(
                {'detail': 'Cannot remove the last admin role. Add another admin role first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Remove the role
    membership.remove_role(role)

    return response.Response({
        'detail': f'Role "{role.name}" removed from {user.username}.',
        'user_id': user.id,
        'username': user.username,
        'removed_role': role.name,
        'current_roles': membership.role_names,
        'primary_role': membership.primary_role.name if membership.primary_role else None
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_primary_role(request, pk, user_id):
    """
    Set a specific role as primary for a member
    """
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)
    user = get_object_or_404(User, pk=user_id)

    # Check permissions
    is_owner = club.owner == request.user

    if not is_owner:
        requester_membership = models.Membership.objects.filter(
            user=request.user, club=club
        ).first()

        if not requester_membership or not requester_membership.has_permission('can_manage_members'):
            # Allow users to set their own primary role
            if request.user != user:
                return response.Response(
                    {'detail': 'You do not have permission to set primary roles.'},
                    status=status.HTTP_403_FORBIDDEN
                )

    # Get membership
    try:
        membership = models.Membership.objects.get(user=user, club=club)
    except models.Membership.DoesNotExist:
        return response.Response(
            {'detail': 'User is not a member of this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get role to set as primary
    role_id = request.data.get('role_id')
    role_name = request.data.get('role_name')

    if not role_id and not role_name:
        return response.Response(
            {'detail': 'Provide either role_id or role_name.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get role
    try:
        if role_id:
            role = models.Role.objects.get(id=role_id, club=club)
        else:
            role = models.Role.objects.get(club=club, name__iexact=role_name)
    except models.Role.DoesNotExist:
        return response.Response(
            {'detail': 'Role not found in this club.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if user has this role
    if not membership.roles.filter(id=role.id).exists():
        return response.Response(
            {'detail': f'User does not have the "{role.name}" role.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set as primary
    membership.set_primary_role(role)

    return response.Response({
        'detail': f'Primary role set to "{role.name}" for {user.username}.',
        'user_id': user.id,
        'username': user.username,
        'primary_role': role.name,
        'all_roles': membership.role_names
    })


# ---------------------------------------------------------------------------
# Permission listing (read-only — surfaces all role permission keys)
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, club_permissions.IsClubAdminOrModerator])
def get_club_permissions(request, pk):
    """
    Get all permissions available for the club
    """
    from django.shortcuts import get_object_or_404

    club = get_object_or_404(models.Club, pk=pk, is_active=True)

    is_member = models.Membership.objects.filter(
        user=request.user, club=club
    ).exists()
    is_owner = club.owner == request.user

    if not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to view permissions.'},
            status=status.HTTP_403_FORBIDDEN
        )

    roles = club.roles.all().order_by('name')
    serializer = serializers.RoleSerializer(
        roles,
        many=True,
        context={'request': request}
    )

    # all unique permission keys from all roles
    all_permissions = sorted(
        list(set().union(*(role.permissions.keys() for role in roles))))

    return response.Response({
        'club_id': str(club.id),
        'club_name': club.name,
        'total_roles': roles.count(),
        'all_permissions': all_permissions,
    })
