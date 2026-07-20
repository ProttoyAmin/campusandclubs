



from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.posts.models import Post
from apps.interactions.models import (
    Comment, 
    Like, 
    Share
)
from apps.posts.serializer import PostMediaSerializer

class PostSerializer(serializers.ModelSerializer):
    """Detailed serializer for user posts with interaction data"""
    id = serializers.CharField()
    author_id = serializers.UUIDField(source='author.id', read_only=True)
    author_username = serializers.CharField(
        source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_url = serializers.SerializerMethodField()

    # Club info for club posts
    club_id = serializers.CharField(
        source='club.id', read_only=True, allow_null=True)
    club_name = serializers.CharField(
        source='club.name', read_only=True, allow_null=True)
    club_url = serializers.SerializerMethodField()

    # NEW: Multiple media support
    images = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()
    media_files = PostMediaSerializer(many=True, read_only=True)

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
            'id', 'url', 'author_id', 'author_username', 'author_avatar', 'author_url',
            'club_id', 'club_name', 'club_url', 'title', 'is_pinned',
            'post_type', 'content',
            'image', 'video', 'image_file', 'video_file', 'image_url', 'video_url',
            'images', 'videos', 'media_files',  # NEW: Multiple media arrays
            'original_post', 'original_post_data',
            'like_count', 'comment_count', 'share_count', 'repost_count',
            'is_liked', 'is_shared', 'can_edit',
            'likes_url', 'comments_url', 'shares_url',
            'like_toggle_url', 'share_toggle_url', 'repost_url',
            'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'club_id',
                            'club_name', 'repost_count', 'created_at', 'updated_at']

    def get_images(self, obj):
        """Get all image media for this post"""
        images = []

        if obj.image_file or obj.image_url:
            request = self.context.get('request')
            images.append({
                'file': obj.image_url,
                'url': request.build_absolute_uri(obj.image_file.url) if obj.image_file and request else (obj.image_file.url if obj.image_file else None)
            })

        request = self.context.get('request')
        for media in obj.media_files.filter(media_type='IMAGE'):
            images.append({
                'file': media.image_url,
                'url': request.build_absolute_uri(media.image_file.url) if media.image_file and request else (media.image_file.url if media.image_file else None)
            })

        return images

    def get_videos(self, obj):
        """Get all video media for this post"""
        videos = []

        if obj.video_file or obj.video_url:
            request = self.context.get('request')
            videos.append({
                'file': obj.video_url,
                'url': request.build_absolute_uri(obj.video_file.url) if obj.video_file and request else (obj.video_file.url if obj.video_file else None)
            })

        request = self.context.get('request')
        for media in obj.media_files.filter(media_type='VIDEO'):
            videos.append({
                'file': media.video_url,
                'url': request.build_absolute_uri(media.video_file.url) if media.video_file and request else (media.video_file.url if media.video_file else None)
            })

        return videos

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
