# apps/posts/views.py
from core.policies.utils import current_user
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
import os, uuid
from apps.interactions.serializers import CommentSerializer
from apps.interactions.models import Like, Comment, Share
from apps.posts.serializers import PostSerializer, PostListSerializer
from apps.posts.models import (
    Post
)
from core.pagination import StandardResultsSetPagination




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_post_like(request: Request, post_id: uuid.UUID):
    """Like or unlike a post (toggle)"""
    post = get_object_or_404(Post, pk=post_id, deleted_at__isnull=True)

    post_content_type = ContentType.objects.get_for_model(post)

    like, created = Like.objects.get_or_create(
        user=current_user(request),
        content_type=post_content_type,
        object_id=post.id
    )

    print(like, created, "like_created")

    if not created:
        like.delete()
        like_count = Like.objects.filter(
            content_type=post_content_type,
            object_id=post.id
        ).count()

        return Response({
            'detail': 'Post unliked.',
            'is_liked': False,
            'like_count': like_count
        }, status=status.HTTP_200_OK)

    like_count = Like.objects.filter(
        content_type=post_content_type,
        object_id=post.id
    ).count()

    return Response({
        'detail': 'Post liked.',
        'is_liked': True,
        'like_count': like_count
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def post_likes(request: Request, post_id: uuid.UUID):
    """Get all likes on a post"""
    post = get_object_or_404(Post, pk=post_id, deleted_at__isnull=True)

    content_type = ContentType.objects.get_for_model(post)
    likes = Like.objects.filter(
        content_type=content_type,
        object_id=post.id
    ).select_related('user')

    likes_data = [
        {
            'id': like.user.id,
            'username': like.user.username,
            'avatar': like.user.avatar,
        }
        for like in likes
    ]

    return Response({
        'post_id': post.id,
        'like_count': likes.count(),
        'likes': likes_data
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def post_comments(request: Request, post_id: uuid.UUID):
    """Get all comments on a post"""
    post = get_object_or_404(Post, pk=post_id, deleted_at__isnull=True)

    if request.method == "POST":
        content = request.data.get('content')
        parent_id = request.data.get('parent')

        if not content:
            return Response(
                {'detail': 'content is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        content_type = ContentType.objects.get_for_model(post)

        # Verify parent if provided
        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, pk=parent_id)
            # Ensure parent is on the same post
            if parent.content_type != content_type or parent.object_id != post.id:
                return Response(
                    {'detail': 'Parent comment does not belong to this post.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create comment
        comment = Comment.objects.create(
            author=request.user,
            content_type=content_type,
            object_id=post.id,
            content=content,
            parent=parent
        )

        return Response({
            'id': comment.id,
            'author_id': comment.author.id,
            'author_username': comment.author.username,
            'content': comment.content,
            'parent': parent_id,
            'created_at': comment.created_at
        }, status=status.HTTP_201_CREATED)

    content_type = ContentType.objects.get_for_model(post)

    comments = Comment.objects.filter(
        content_type=content_type,
        object_id=post.id
    ).select_related('author').order_by('created_at')

    paginator = StandardResultsSetPagination()
    paginated_comments = paginator.paginate_queryset(comments, request)

    comments_data = []

    for comment in paginated_comments:
        comment_content_type = ContentType.objects.get_for_model(comment)
        is_liked = False
        if request.user.is_authenticated:
            is_liked = Like.objects.filter(
                user=request.user,
                content_type=comment_content_type,
                object_id=comment.id
            ).exists()

        like_count = Like.objects.filter(
            content_type=comment_content_type,
            object_id=comment.id
        ).count()

        comments_data.append({
            'id': comment.id,
            'author_id': comment.author.id,
            'author_username': comment.author.username,
            'author_avatar': request.build_absolute_uri(comment.author.profile_picture.url) if getattr(comment.author, 'profile_picture', None) else None,
            'content': comment.content,
            'is_edited': comment.is_edited,
            'like_count': like_count,
            'reply_count': comment.replies.count(),
            'is_liked': is_liked,
            'parent': str(comment.parent_id),
            'can_edit': request.user.is_authenticated and comment.author == request.user,
            'created_at': comment.created_at,
            'updated_at': comment.updated_at
        })

    return paginator.get_paginated_response(comments_data)
