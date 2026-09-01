from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.posts.models import Post
from apps.interactions.models import (
    Comment,
    Like,
    Share
)
from apps.posts.serializer import PostMediaSerializer
from apps.media.serializers import MediaListSerializer


class PostSerializer(serializers.ModelSerializer):
    """Detailed serializer for user posts with interaction data"""
    id = serializers.CharField()
    author = serializers.SerializerMethodField()
    author_url = serializers.SerializerMethodField()

    # Club info for club posts
    club = serializers.SerializerMethodField()
    club_url = serializers.SerializerMethodField()

    # NEW: Multiple media support
    # images = serializers.SerializerMethodField()
    # videos = serializers.SerializerMethodField()
    # media_files = PostMediaSerializer(many=True, read_only=True)
    media = MediaListSerializer(many=True, read_only=True)

    # Interaction counts
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    share_count = serializers.SerializerMethodField()
    repost_count = serializers.IntegerField(read_only=True)

    # User-specific data
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    # Original post info (for reposts)
    original_post_data = serializers.SerializerMethodField()

    # URLs (GitHub style)
    url = serializers.SerializerMethodField()
    likes_url = serializers.SerializerMethodField()
    comments_url = serializers.SerializerMethodField()
    shares_url = serializers.SerializerMethodField()
    like_toggle_url = serializers.SerializerMethodField()
    share_toggle_url = serializers.SerializerMethodField()
    repost_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'url',
            'author', 'author_url',
            'club', 'club_url',
            'title', 'is_pinned', 'content', 'media',
            'original_post', 'original_post_data',
            'like_count', 'comment_count', 'share_count', 'repost_count',
            'is_liked', 'is_shared', 'can_edit',
            'likes_url', 'comments_url', 'shares_url',
            'like_toggle_url', 'share_toggle_url', 'repost_url',
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'club', 'club_url',
                            'repost_count', 'created_at', 'updated_at']

    def get_author(self, obj: Post):
        from apps.accounts.serialize.user.profile import UserMinimalSerializer
        return UserMinimalSerializer(obj.author, context=self.context).data

    def get_club(self, obj: Post):
        from apps.clubs.serializer.club.club import ClubMinimalSerializer
        return ClubMinimalSerializer(obj.club, context=self.context).data if obj.club else None

    def get_author_avatar(self, obj):
        """Get author's avatar (profile picture or avatar URL)"""
        if obj.author.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.author.profile_picture.url)
        return obj.author.avatar

    def get_author_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/accounts/auth/users/{obj.author.id}/')
        return None

    def get_club_url(self, obj):
        """Get club URL if this is a club post"""
        if obj.club:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/api/v1/clubs/{obj.club.id}/')
        return None

    def get_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/')
        return None

    def get_likes_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/likes/')
        return None

    def get_comments_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/comments/')
        return None

    def get_shares_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/shares/')
        return None

    def get_like_toggle_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/like/')
        return None

    def get_share_toggle_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/share/')
        return None

    def get_repost_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/posts/{obj.id}/repost/')
        return None

    def get_like_count(self, obj):
        content_type = ContentType.objects.get_for_model(Post)
        return Like.objects.filter(content_type=content_type, object_id=obj.id).count()

    def get_comment_count(self, obj):
        content_type = ContentType.objects.get_for_model(Post)
        return Comment.objects.filter(
            content_type=content_type,
            object_id=obj.id,
            parent=None
        ).count()

    def get_share_count(self, obj):
        content_type = ContentType.objects.get_for_model(Post)
        return Share.objects.filter(content_type=content_type, object_id=obj.id).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            content_type = ContentType.objects.get_for_model(Post)
            return Like.objects.filter(
                user=request.user,
                content_type=content_type,
                object_id=obj.id
            ).exists()
        return False

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            content_type = ContentType.objects.get_for_model(Post)
            return Share.objects.filter(
                user=request.user,
                content_type=content_type,
                object_id=obj.id
            ).exists()
        return False

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False

    def get_original_post_data(self, obj):
        """Return lightweight data about original post if this is a repost"""
        if obj.original_post and not obj.original_post.is_deleted:
            return {
                'id': str(obj.original_post.id),
                'author_username': obj.original_post.author.username,
                'author_avatar': self.get_author_avatar(obj.original_post),
                'content': obj.original_post.content[:100] + '...' if obj.original_post.content and len(obj.original_post.content) > 100 else obj.original_post.content,
                'post_type': obj.original_post.post_type,
                'image': obj.original_post.image,
                'video': obj.original_post.video,
                'image_file': obj.original_post.image_file.url if obj.original_post.image_file else None,
                'video_file': obj.original_post.video_file.url if obj.original_post.video_file else None,
                'image_url': obj.original_post.image_url,
                'video_url': obj.original_post.video_url,
                'created_at': obj.original_post.created_at
            }
        return None
