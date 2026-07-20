from rest_framework.request import Request


from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch, Q
from rest_framework import permissions, response, status


from apps.clubs.models import (
    Club,
    Membership
)

from apps.clubs.serializer.club.club import ClubSerializer
from apps.clubs.serializer.club.club_details import ClubDetailSerializer


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def club_info(request: Request, pk) -> response.Response:
    """
    Retrieve, update, or delete a club.
    - GET: Public clubs visible to all; private clubs only to members
    - PATCH: Only club owner or admins with can_manage_settings
    - DELETE: Only club owner
    """
    # Base queryset
    base_qs = Club.objects.filter(status='active')

    if request.method == 'GET':
        club_qs = base_qs.filter(
            Q(privacy='public') | Q(members=request.user)
        )
    else:
        club_qs = base_qs.filter(members=request.user)

    club = get_object_or_404(
        club_qs.annotate(
            member_count=Count('members', distinct=True),
            # post_count=Count('club_posts', distinct=True),
            event_count=Count('events', distinct=True),
        ).prefetch_related(
            Prefetch(
                'memberships',
                queryset=Membership.objects.filter(
                    user=request.user).prefetch_related('roles'),
                to_attr='user_memberships'
            )
        ).select_related('owner'),
        pk=pk
    )

    if request.method == 'GET':
        serializer = ClubDetailSerializer(
            club, context={'request': request})
        return response.Response(serializer.data)

    is_owner = (request.user == club.owner)
    has_admin_perm = False

    if not is_owner:
        memberships = getattr(club, 'user_memberships', [])
        if memberships:
            has_admin_perm = memberships[0].has_permission(
                'can_manage_settings')

    if request.method == 'PATCH':
        if not (is_owner or has_admin_perm):
            return response.Response(
                {'detail': 'Only club owners or admins can edit club settings.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ClubSerializer(
            club, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            club = Club.objects.annotate(
                member_count=Count('members', distinct=True),
                # post_count=Count('club_posts', distinct=True),
                event_count=Count('events', distinct=True),
            ).prefetch_related(
                Prefetch(
                    'memberships',
                    queryset=Membership.objects.filter(
                        user=request.user).prefetch_related('roles'),
                    to_attr='user_memberships'
                )
            ).get(pk=club.pk)

            detail_serializer = ClubDetailSerializer(
                club, context={'request': request})
            return response.Response(detail_serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        from django.utils import timezone
        if not is_owner:
            return response.Response({'detail': 'Only the club owner can delete the club.'},
                                     status=status.HTTP_403_FORBIDDEN
                                     )

        club.deleted_at = timezone.now()
        club.save()
        return response.Response(
            {'detail': f'{club.name} has been deleted.'},
            status=status.HTTP_200_OK
        )
    
    return response.Response({'detail': 'Method Not Allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)




@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_club(request, pk):
    """
    Join a public or closed club.
    Secret clubs cannot be joined via this endpoint (must be invited).
    """
    from apps.clubs.models import Role
    club: Club = get_object_or_404(Club, pk=pk, status='active')

    # Prevent joining secret clubs
    if club.privacy == 'secret':
        return response.Response(
            {'detail': 'Cannot join secret clubs directly. You must be invited.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Check if already member
    if Membership.objects.filter(user=request.user, club=club).exists():
        return response.Response(
            {'detail': f'You are already a member of {club.name}.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get default role
    default_role = club.roles.filter(is_default=True).first()

    if not default_role:
        # Get Member role if exists
        default_role = club.roles.filter(name__iexact='Member').first()

        if not default_role:
            # Create default member role
            default_role = Role.objects.create(
                club=club,
                name='Member',
                is_default=True,
                color='#95A5A6'
            )

    # Create membership
    membership = Membership.objects.create(
        user=request.user,
        club=club
    )
    if default_role:
        membership.add_role(default_role, set_as_primary=True)

    return response.Response(
        {
            'detail': f'Successfully joined {club.name}.',
            'club': {
                'id': str(club.id),
                'name': club.name,
                'origin': club.origin,
                'slug': club.slug
            },
            'role': default_role.name if default_role else None
        },
        status=status.HTTP_201_CREATED
    )





@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_clubs(request):
    """
    Get recommended clubs for the authenticated user based on:
    - Clubs with similar origin/type
    - Clubs with friends/mutual connections
    - Popular clubs in user's location
    - Clubs related to user's interests (if available)
    """
    from apps.accounts.serialize.user import UserProfileSerializer
    user = request.user

    # Base query for active clubs
    clubs = Club.objects.filter(status='active')
    clubs = clubs.exclude(privacy='secret')

    # Exclude clubs user is already a member of
    user_club_ids = Membership.objects.filter(
        user=user).values_list('club_id', flat=True)
    clubs = clubs.exclude(id__in=user_club_ids)
    

    # Priority 1: Clubs with same origin as user's clubs
    user_origins = Membership.objects.filter(
        user=user
    ).values_list('club__origin', flat=True).distinct()

    if user_origins:
        clubs_same_origin = clubs.filter(origin__in=user_origins)
        if clubs_same_origin.exists():
            clubs = clubs_same_origin

    # If no same-origin clubs, try clubs from same origin as user's profile
    if hasattr(user, 'profile') and user.profile.origin:
        clubs_same_origin = clubs.filter(origin__iexact=user.profile.origin)
        if clubs_same_origin.exists():
            clubs_same_origin = clubs_same_origin.exclude(
                id__in=clubs.values_list('id', flat=True)
            )
            clubs = clubs | clubs_same_origin

    # (assuming user has department/origin field)
    # if not clubs.exists() and hasattr(user, 'department'):
    #     clubs = clubs.filter(origin__icontains=user.department)

    # Filter public clubs if user doesn't have specific origin matches
    if not clubs.exists():
        clubs = clubs.filter(is_public=True)
        
    # Annotate with popularity metrics
    # clubs = clubs.annotate(
    #     member_count=Count('members', distinct=True),
    #     # post_count=Count('club_posts', distinct=True),
    #     # engagement_score=Count('club_posts', distinct=True) +
    #     # Count('members', distinct=True)
    #     # Limit to 20 recommendations
    # ).order_by('-engagement_score', '-member_count')[:20]

    # Add user membership info
    clubs = clubs.prefetch_related(
        Prefetch(
            'memberships',
            queryset=Membership.objects.filter(
                user=user).prefetch_related('roles'),
            to_attr='user_memberships'
        )
    )
    

    serializer = ClubSerializer(
        clubs, many=True, context={'request': request}
    )
    # user_serializer = UserProfileSerializer(user)

    return response.Response({
        # 'user': user_serializer.data,
        'user_id': user.id,
        'username': user.username,
        'recommendation_basis': 'engagement_and_popularity',
        'total_recommendations': clubs.count(),
        'clubs': serializer.data
    })
