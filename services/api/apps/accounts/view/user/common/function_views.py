from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.response import Response


from rest_framework.response import Response


from django.shortcuts import get_object_or_404

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes


from apps.accounts.models import User
from apps.connections.models import Follow
from apps.accounts.serialize.user.profile import UserProfileSerializer
from apps.accounts.policies.user import UserPolicy
from core.policies.utils import current_user


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_user_by_username(request: Request, username: str) -> Response:
    """Get user profile by username"""
    user = get_object_or_404(User, username=username)

    policy = UserPolicy(current_user(request), user)

    can_view = policy.view(viewer=current_user(request))

    if not can_view:
        return Response(
            {
                'detail': 'This profile is private.',
                'id': str(user.id),
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar' : request.build_absolute_uri(user.profile_picture.url if user.profile_picture else None),
                'following_count' : user.following_count,
                'follower_count' : user.follower_count,
                'user_post_count' : user.user_post_count,
                'is_private': True,
                'is_following': user.is_followed_by(request.user) if hasattr(user, 'is_followed_by') else False,
                'follow_status': Follow.get_follow_status(request.user, user) if hasattr(Follow, 'get_follow_status') else None
            },
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = UserProfileSerializer(
        user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_users(request: Request) -> Response:
    """Get any user's public profile"""
    users = User.objects.all()

    if not users:
        return Response(
            {'detail': 'No users right now in your database.'},
            status=status.HTTP_204_NO_CONTENT
        )

    visible_fields = [
        'id',
        'username',
        'email',
        'avatar',
        'url', 
        'password'
    ]

    serializer = UserProfileSerializer(
        users,
        many=True,
        context={'request': request},
        fields=visible_fields
    )
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request) -> Response:
    """Get current authenticated user's profile"""
    serializer = UserProfileSerializer(
        request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_activity(request: Request, user_id: str) -> Response:
    """Get user's recent activity (likes, comments, shares)"""
    user = get_object_or_404(User, pk=user_id)

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
def get_user_clubs(request, user_id) -> Response:
    """Get all clubs a user has joined"""
    from apps.clubs.serializers import ClubListSerializer
    from apps.accounts.serialize.user import UserClubMembershipSerializer
    from apps.clubs.models import Membership

    
    user = get_object_or_404(User, pk=user_id)
    print("user", user)

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
             'avatar' : request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
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