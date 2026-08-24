from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes

from django.shortcuts import get_object_or_404

from apps.accounts.models import User
from apps.connections.models import Follow
from apps.accounts.serialize.user.profile import UserProfileSerializer
from apps.accounts.serialize.user.email import UserEmailSerializer
from apps.accounts.schema import my_affiliations_schema, my_emails_schema
from apps.institutes.serializers.affiliates.affiliates_serializer import (
    InstituteAffiliateForUserSerializer,
)
from apps.accounts.policies.user import UserPolicy
from core.policies.utils import current_user



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request) -> Response:
    """Get current authenticated user's profile"""
    serializer = UserProfileSerializer(
        request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_activity(request: Request, username: str) -> Response:
    """Get user's recent activity (likes, comments, shares)"""
    user = get_object_or_404(User, username=username)

    # Only user themselves can see their full activity
    if request.user != user:
        return Response(
            {'detail': 'You can only view your own activity.'},
            status=status.HTTP_403_FORBIDDEN
        )

    limit = int(request.query_params.get('limit', 10))
    activity = user.get_recent_activity(limit=limit)

    from apps.interactions.serializers import LikeSerializer, CommentSerializer, ShareSerializer

    return Response({
        'user_id': user.id,
        'username': user.username,
        'recent_likes': LikeSerializer(activity['likes'], many=True, context={'request': request}).data,
        'recent_comments': CommentSerializer(activity['comments'], many=True, context={'request': request}).data,
        'recent_shares': ShareSerializer(activity['shares'], many=True, context={'request': request}).data,
    })




@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_clubs(request, username) -> Response:
    """Get all clubs a user has joined"""
    from apps.clubs.serializer.club.club import ClubListSerializer
    from apps.accounts.serialize.user import UserClubMembershipSerializer
    from apps.clubs.models import Membership

    user = get_object_or_404(User, username=username)

    if user.is_private and request.user != user:
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'This profile is private.'},
                status=status.HTTP_403_FORBIDDEN
            )

        is_following = Follow.objects.filter(
            follower=request.user,
            following=user,
            status='accepted'
        ).exists()

        if not is_following:
            return Response(
                {'detail': 'This profile is private. You must follow this user to view their clubs.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return Response(
            {'detail': 'This profile is private.',
             'username': user.username,
             'avatar' : request.build_absolute_uri(user.avatar.url) if user.avatar else None,
             'is_private': user.is_private
             },
            status=status.HTTP_403_FORBIDDEN
        )
        
    clubs = user.owned_clubs.all()
    

    memberships = Membership.objects.filter(
        user=user
    ).select_related('club').prefetch_related('roles')

    role_name = request.query_params.get('role')

    if role_name:
        memberships = memberships.filter(role__name__iexact=role_name)

    serializer = UserClubMembershipSerializer(
        memberships,
        many=True,
        context={'request': request}
    )
    
    serializer = ClubListSerializer(
        clubs,
        many=True,
        context={'request': request}
    )

    return Response({
        'user_id': user.id,
        'username': user.username,
        'club_count': memberships.count(),
        'clubs': serializer.data
    })


@my_affiliations_schema
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_affiliations(request: Request) -> Response:
    """List the authenticated user's institute affiliations."""
    user: User = current_user(request)
    affiliations = user.affiliations.filter(is_active=True)
    serializer = InstituteAffiliateForUserSerializer(
        affiliations, many=True, context={'request': request}
    )
    return Response(serializer.data)


@my_emails_schema
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_emails(request: Request) -> Response:
    """
    List the authenticated user's email addresses (allauth EmailAddress
    rows). Used to populate the email selector on the affiliation-claim
    form.
    """
    user: User = current_user(request)
    emails = user.emailaddress_set.filter(verified=True)
    serializer = UserEmailSerializer(
        emails, many=True, context={'request': request}
    )
    return Response(serializer.data)