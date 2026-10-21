# apps/interactions/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404

from .models import Like, Comment, Share
from . import serializers
from core.pagination import StandardResultsSetPagination

# ==================== HELPER FUNCTIONS ====================

def get_content_object(content_type_str, object_id):
    """
    Helper to get any object by content type and ID
    content_type_str format: "app_label.model_name" (e.g., "clubs.clubpost")
    """
    try:
        app_label, model = content_type_str.lower().split('.')
        content_type = ContentType.objects.get(
            app_label=app_label, model=model)
        model_class = content_type.model_class()
        return get_object_or_404(model_class, pk=object_id)
    except (ValueError, ContentType.DoesNotExist):
        return None


# ==================== LIKE VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_likes(request):
    """
    Get all likes for a specific content object
    Query params:
    - content_type: app_label.model_name (e.g., "clubs.clubpost")
    - object_id: ID of the object

    Example: /api/v1/activities/likes/?content_type=clubs.clubpost&object_id=123
    """
    content_type_str = request.query_params.get('content_type')
    object_id = request.query_params.get('object_id')

    if not content_type_str or not object_id:
        likes = Like.objects.all().select_related('user')
        serializer = serializers.LikeSerializer(likes, many=True, context={'request': request})
        return Response(
            {'detail': 'content_type and object_id are required. Returning all likes.', 
             'likes': serializer.data},
            status=status.HTTP_200_OK
        )
        # return Response(
        #     {'detail': 'content_type and object_id are required.'},
        #     status=status.HTTP_400_BAD_REQUEST
        # )

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': 'Content object not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Get likes
    likes = Like.objects.filter(
        content_type=content_type,
        object_id=object_id
    ).select_related('user')

    serializer = serializers.LikeSerializer(
        likes, many=True, context={'request': request})

    return Response({
        'content_type': content_type_str,
        'object_id': str(object_id),
        'like_count': likes.count(),
        'likes': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request):
    """
    Like or unlike any content object (toggle)
    Body: {
        "content_type": "clubs.clubpost",
        "object_id": 123
    }

    Returns: { "is_liked": true/false, "like_count": 42 }
    """
    content_type_str = request.data.get('content_type')
    object_id = request.data.get('object_id')

    if not content_type_str or not object_id:
        return Response(
            {'detail': 'content_type and object_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': 'Content object not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Toggle like
    like, created = Like.objects.get_or_create(
        user=request.user,
        content_type=content_type,
        object_id=object_id
    )

    if not created:
        # Unlike (delete the like)
        like.delete()

        # Recalculate like count
        like_count = Like.objects.filter(
            content_type=content_type,
            object_id=object_id
        ).count()

        return Response({
            'detail': 'Unliked successfully.',
            'is_liked': False,
            'like_count': like_count
        }, status=status.HTTP_200_OK)

    # Calculate like count
    like_count = Like.objects.filter(
        content_type=content_type,
        object_id=object_id
    ).count()

    return Response({
        'detail': 'Liked successfully.',
        'is_liked': True,
        'like_count': like_count
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_like_status(request):
    """
    Check if current user has liked a specific object
    Query params:
    - content_type: app_label.model_name
    - object_id: ID of the object

    Returns: { "is_liked": true/false }
    """
    content_type_str = request.query_params.get('content_type')
    object_id = request.query_params.get('object_id')

    if not content_type_str or not object_id:
        return Response(
            {'detail': 'content_type and object_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        app_label, model = content_type_str.lower().split('.')
        content_type = ContentType.objects.get(
            app_label=app_label, model=model)

        is_liked = Like.objects.filter(
            user=request.user,
            content_type=content_type,
            object_id=object_id
        ).exists()

        return Response({'is_liked': is_liked})
    except (ValueError, ContentType.DoesNotExist):
        return Response(
            {'detail': 'Invalid content_type.'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ==================== COMMENT VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_comments(request):
    """
    Get all comments for a specific content object
    Query params:
    - content_type: app_label.model_name
    - object_id: ID of the object
    - parent: (optional) ID of parent comment for nested replies

    Example: /api/v1/activities/comments/?content_type=posts.Post&object_id=123
    """
    content_type_str = request.query_params.get('content_type')
    object_id = request.query_params.get('object_id')
    parent_id = request.query_params.get('parent')

    if not content_type_str or not object_id:
        all_comments = Comment.objects.all().select_related('author')
        paginator = StandardResultsSetPagination()
        paginated_comments = paginator.paginate_queryset(all_comments, request)

        serializer = serializers.CommentSerializer(
            paginated_comments,
            many=True,
            context={'request': request}
        )

        return paginator.get_paginated_response(serializer.data)
    

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': f"Content object type {content_type_str} doesn't support comments."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Get comments (only root comments or replies to a specific parent)
    comments = Comment.objects.filter(
        content_type=content_type,
        object_id=object_id
    ).select_related('author')

    if parent_id:
        # Get replies to a specific comment
        comments = comments.filter(parent_id=parent_id)
    else:
        # Get only root comments (no parent)
        comments = comments.filter(parent=None)

    all_comments = Comment.objects.all().select_related('author')

    # Pagination
    paginator = StandardResultsSetPagination()
    paginated_comments = paginator.paginate_queryset(comments, request)

    serializer = serializers.CommentSerializer(
        paginated_comments,
        many=True,
        context={'request': request}
    )

    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request):
    """
    Create a comment on any content object
    Body: {
        "content_type": "clubs.clubpost",
        "object_id": 123,
        "content": "Great post!",
        "parent": null  // Optional: ID of parent comment for replies
    }
    """
    content_type_str = request.data.get('content_type')
    object_id = request.data.get('object_id')
    content = request.data.get('content')
    parent_id = request.data.get('parent')

    if not content_type_str or not object_id or not content:
        return Response(
            {'detail': 'content_type, object_id, and content are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': 'Content object not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Verify parent comment if provided
    parent = None
    if parent_id:
        parent = get_object_or_404(Comment, pk=parent_id)
        # Ensure parent comment is on the same object
        if parent.content_type != content_type or parent.object_id != int(object_id):
            return Response(
                {'detail': 'Parent comment does not belong to this object.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Create comment
    comment = Comment.objects.create(
        author=request.user,
        content_type=content_type,
        object_id=object_id,
        content=content,
        parent=parent
    )

    serializer = serializers.CommentSerializer(
        comment, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_comment(request, comment_id):
    """
    Get, update, or delete a specific comment
    - GET: Anyone can view
    - PATCH: Only author can edit
    - DELETE: Author can delete
    """
    comment = get_object_or_404(Comment, pk=comment_id)

    if request.method == 'GET':
        serializer = serializers.CommentSerializer(
            comment, context={'request': request})
        return Response(serializer.data)

    # Check if user is the author
    if comment.author != request.user:
        return Response(
            {'detail': 'You do not have permission to modify this comment.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'PATCH':
        content = request.data.get('content')
        if not content:
            return Response(
                {'detail': 'content is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment.content = content
        comment.is_edited = True
        comment.save()

        serializer = serializers.CommentSerializer(
            comment, context={'request': request})
        return Response(serializer.data)

    if request.method == 'DELETE':
        comment.delete()
        return Response(
            {'detail': 'Comment deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


# @api_view(['GET'])
# @permission_classes([AllowAny])
# def get_comment_replies(request, comment_id):
#     """
#     Get all replies to a specific comment
#     """
#     parent_comment = get_object_or_404(Comment, pk=comment_id)

#     replies = Comment.objects.filter(
#         parent=parent_comment).select_related('author')

#     # Pagination
#     paginator = StandardResultsSetPagination()
#     paginated_replies = paginator.paginate_queryset(replies, request)
#     print("paginated replies",paginated_replies)

#     serializer = serializers.CommentSerializer(
#         paginated_replies,
#         many=True,
#         context={'request': request}
#     )
    
#     print('serialized dataa: ', serializer.data)

#     return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comment_replies(request, comment_id):
    """Get all replies to a specific comment"""
    from apps.interactions.serializers import CommentSerializer
    parent_comment = get_object_or_404(Comment, pk=comment_id)
    
    replies = Comment.objects.filter(parent=parent_comment).select_related('author').order_by('created_at')
    serializer = CommentSerializer(replies, many=True, context={"request": request})
    paginator = StandardResultsSetPagination()
    paginated_replies = paginator.paginate_queryset(serializer.data, request)
    
    return paginator.get_paginated_response(paginated_replies)


# ==================== SHARE VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_shares(request):
    """
    Get all shares for a specific content object
    Query params:
    - content_type: app_label.model_name
    - object_id: ID of the object
    """
    content_type_str = request.query_params.get('content_type')
    object_id = request.query_params.get('object_id')

    if not content_type_str or not object_id:
        return Response(
            {'detail': 'content_type and object_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': 'Content object not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Get shares
    shares = Share.objects.filter(
        content_type=content_type,
        object_id=object_id
    ).select_related('user')

    serializer = serializers.ShareSerializer(
        shares, many=True, context={'request': request})

    return Response({
        'content_type': content_type_str,
        'object_id': object_id,
        'share_count': shares.count(),
        'shares': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_share(request):
    """
    Share any content object
    Body: {
        "content_type": "clubs.clubpost",
        "object_id": 123,
        "message": "Check this out!"  // Optional
    }
    """
    content_type_str = request.data.get('content_type')
    object_id = request.data.get('object_id')
    message = request.data.get('message', '')

    if not content_type_str or not object_id:
        return Response(
            {'detail': 'content_type and object_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify object exists
    content_object = get_content_object(content_type_str, object_id)
    if not content_object:
        return Response(
            {'detail': 'Content object not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get content type
    app_label, model = content_type_str.lower().split('.')
    content_type = ContentType.objects.get(app_label=app_label, model=model)

    # Create or get share (prevent duplicate shares)
    share, created = Share.objects.get_or_create(
        user=request.user,
        content_type=content_type,
        object_id=object_id,
        defaults={'message': message}
    )

    if not created:
        return Response(
            {'detail': 'You have already shared this content.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = serializers.ShareSerializer(
        share, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_share(request):
    """
    Unshare (delete a share)
    Body: {
        "content_type": "clubs.clubpost",
        "object_id": 123
    }
    """
    content_type_str = request.data.get('content_type')
    object_id = request.data.get('object_id')

    if not content_type_str or not object_id:
        return Response(
            {'detail': 'content_type and object_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        app_label, model = content_type_str.lower().split('.')
        content_type = ContentType.objects.get(
            app_label=app_label, model=model)

        share = Share.objects.get(
            user=request.user,
            content_type=content_type,
            object_id=object_id
        )
        share.delete()

        return Response(
            {'detail': 'Share deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
    except Share.DoesNotExist:
        return Response(
            {'detail': 'Share not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


# ==================== USER ACTIVITY VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_likes(request):
    """
    Get all content the current user has liked
    Optional query param: content_type to filter by type
    """
    content_type_str = request.query_params.get('content_type')

    likes = Like.objects.filter(user=request.user).select_related('user')

    if content_type_str:
        try:
            app_label, model = content_type_str.lower().split('.')
            content_type = ContentType.objects.get(
                app_label=app_label, model=model)
            likes = likes.filter(content_type=content_type)
        except (ValueError, ContentType.DoesNotExist):
            return Response(
                {'detail': 'Invalid content_type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    paginator = StandardResultsSetPagination()
    paginated_likes = paginator.paginate_queryset(likes, request)

    serializer = serializers.LikeSerializer(
        paginated_likes, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_comments(request):
    """
    Get all comments by the current user
    Optional query param: content_type to filter by type
    """
    content_type_str = request.query_params.get('content_type')

    comments = Comment.objects.filter(
        author=request.user).select_related('author')

    if content_type_str:
        try:
            app_label, model = content_type_str.lower().split('.')
            content_type = ContentType.objects.get(
                app_label=app_label, model=model)
            comments = comments.filter(content_type=content_type)
        except (ValueError, ContentType.DoesNotExist):
            return Response(
                {'detail': 'Invalid content_type.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    paginator = StandardResultsSetPagination()
    paginated_comments = paginator.paginate_queryset(comments, request)

    serializer = serializers.CommentSerializer(
        paginated_comments,
        many=True,
        context={'request': request}
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_shares(request):
    """
    Get all content the current user has shared
    """
    shares = Share.objects.filter(user=request.user).select_related('user')

    paginator = StandardResultsSetPagination()
    paginated_shares = paginator.paginate_queryset(shares, request)

    serializer = serializers.ShareSerializer(
        paginated_shares, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)
