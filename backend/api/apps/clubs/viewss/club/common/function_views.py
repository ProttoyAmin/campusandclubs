from django.db.models import QuerySet
from rest_framework.request import Request

from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework import permissions, response, status

from core.policies.utils import current_user
from core.views import ServiceMixin
from apps.clubs.models import (
    Club,
    Membership,
    Visibility,
    ClubStatus,
)
from apps.clubs.services.club.club_service import ClubService
from apps.clubs.serializer.club.club import ClubSerializer
from apps.clubs.serializer.club.club_details import ClubDetailSerializer



# from rest_framework.decorators import api_view, permission_classes
# from rest_framework import permissions, response, status
# from django.db.models import Count, Prefetch
# from django.shortcuts import get_object_or_404
# from django.contrib.contenttypes.models import ContentType
# from apps.interactions.models import Like, Comment, Share


# from . import models, permissions as club_permissions
# from core import pagination
# from apps.posts.serializers import PostSerializer
# from apps.posts.models import Post


# # ==================== POST VIEWS ====================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_posts(request: Request, pk:str)->response.Response:
    """
    List all posts in a club with interaction counts
    """
    from apps.posts.models import Post
    from apps.posts.serializer.post_serializers import PostSerializer
    from core import pagination
    club: Club = get_object_or_404(Club, pk=pk)

    media_only = request.query_params.get('media', 'False') == 'True'

    # Check if user is owner or member
    # if request.user != club.owner and not models.Membership.objects.filter(user=request.user, club=club).exists():
    #     return response.Response(
    #         {'detail': 'You must be a club member to view posts.'},
    #         status=status.HTTP_403_FORBIDDEN
    #     )
    if request.user != club.owner and not club.privacy == Visibility.PUBLIC and not Membership.objects.filter(user=request.user, club=club).exists():
        return response.Response(
            {'detail': 'This is a private club. Join to view posts'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Query Post model where club matches
    if media_only:
        posts = Post.objects.filter(
            club=club, is_deleted=False, media__isnull=False).select_related('author', 'club')
    else:
        posts = Post.objects.filter(
            club=club, is_deleted=False).select_related('author', 'club')

    paginator = pagination.StandardResultsSetPagination()
    paginated_posts = paginator.paginate_queryset(posts, request)

    serializer = PostSerializer(
        paginated_posts,
        many=True,
        context={'request': request}
    )

    # Efficiently fetch and map author roles
    data = serializer.data
    author_ids = [post.author_id for post in paginated_posts]

    author_is_owner_map = {}
    for user_id in author_ids:
        if user_id == club.owner_id:
            author_is_owner_map[user_id] = True

    # Inject is_owner into response data
    for item in data:
        author_id = item.get('author_id')
        item['is_owner'] = author_is_owner_map.get(author_id, False)

    return paginator.get_paginated_response(data)



# ---------------------------------------------------------------------------
# recommended_clubs
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_clubs(request: Request) -> response.Response:
    """Get recommended clubs for the authenticated user.

    Recommendation order:
      1. Public/closed clubs the user is not already a member of.
      2. Bias toward clubs sharing the user's existing club origins.
      3. Fallback to clubs sharing the user's profile origin.
      4. Final fallback: any active public club.
    """
    service = ClubService(actor=current_user(request))
    clubs = service.recommend_for_user(current_user(request))

    serializer = ClubSerializer(
        clubs, many=True, context={'request': request}
    )
    return response.Response({
        'user_id': current_user(request).id,
        'username': current_user(request).username,
        'recommendation_basis': 'engagement_and_popularity',
        'total_recommendations': clubs.count(),
        'clubs': serializer.data
    })


# ---------------------------------------------------------------------------
# trending_clubs
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def trending_clubs(request: Request) -> response.Response:
    """Get trending clubs (most active/popular in last 7 days)."""
    service = ClubService()
    clubs = service.trending_clubs()

    serializer = ClubSerializer(
        clubs, many=True, context={'request': request}
    )
    return response.Response({
        'period': 'last_7_days',
        'total_trending': clubs.count(),
        'clubs': serializer.data
    })


# ---------------------------------------------------------------------------
# search_clubs
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_clubs(request: Request) -> response.Response:
    """Search clubs by name, origin, about, or slug."""
    from core import pagination

    query = request.query_params.get('q', '')
    if not query or len(query.strip()) < 2:
        return response.Response(
            {'detail': 'Search query must be at least 2 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    service = ClubService()
    clubs = service.search_clubs(query.strip())

    paginator = pagination.StandardResultsSetPagination()
    paginated_clubs = paginator.paginate_queryset(clubs, request)
    serializer = ClubSerializer(
        paginated_clubs, many=True, context={'request': request}
    )
    return paginator.get_paginated_response({
        'query': query,
        'total_results': clubs.count(),
        'results': serializer.data
    })


# ---------------------------------------------------------------------------
# clubs_by_origin
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def clubs_by_origin(request: Request, origin: str) -> response.Response:
    """Get all public clubs from a specific origin."""
    from core import pagination

    service = ClubService()
    clubs = service.clubs_by_origin(origin)

    paginator = pagination.StandardResultsSetPagination()
    paginated_clubs = paginator.paginate_queryset(clubs, request)
    serializer = ClubSerializer(
        paginated_clubs, many=True, context={'request': request}
    )
    return paginator.get_paginated_response({
        'origin': origin,
        'total_clubs': clubs.count(),
        'clubs': serializer.data
    })


# ---------------------------------------------------------------------------
# club_stats
# ---------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def club_stats(request: Request, pk) -> response.Response:
    """Get detailed statistics for a club.

    Member/owner see full stats; non-members only see public-club stats.
    """
    from django.utils import timezone
    from datetime import timedelta

    club = get_object_or_404(Club, pk=pk, status=ClubStatus.ACTIVE)

    is_member = Membership.objects.filter(
        user=request.user, club=club).exists()
    is_owner = club.owner == request.user

    if club.privacy != Visibility.PUBLIC and not (is_member or is_owner):
        return response.Response(
            {'detail': 'You must be a club member to view statistics.'},
            status=status.HTTP_403_FORBIDDEN
        )

    since = timezone.now() - timedelta(days=30)
    service = ClubService(actor=current_user(request))
    stats = service.get_club_stats(club, since=since)

    return response.Response({
        'club_id': str(club.id),
        'club_name': club.name,
        'overview': {
            'total_members': stats['member_count'],
            'total_posts': stats['post_count'],
            'total_events': stats['event_count'],
            'created_at': club.created_at,
            'privacy': club.privacy,
        },
        'recent_activity': {
            'posts_last_30_days': stats['recent_posts'],
            'events_last_30_days': stats['recent_events'],
            'new_members_last_30_days': stats['new_members'],
            'engagement_rate': stats['engagement_rate'],
        },
        'role_distribution': stats['roles_data'],
        'membership_info': {
            'is_member': is_member,
            'is_owner': is_owner,
            'joined_at': Membership.objects.filter(
                user=request.user, club=club
            ).values_list('joined_at', flat=True).first() if is_member else None
        }
    })
