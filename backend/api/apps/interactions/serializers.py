from django.urls import reverse
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Like, Comment, Share

class LikeSerializer(serializers.ModelSerializer):
    """Works for ANY content type due to GenericForeignKey"""
    id = serializers.CharField()
    username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    object_id = serializers.CharField()

    class Meta:
        model = Like
        fields = "__all__"

    def get_user_avatar(self, obj):
        return getattr(obj.user, 'avatar', None)


class CommentSerializer(serializers.ModelSerializer):
    """Works for ANY content type"""
    id = serializers.CharField(read_only=True)
    author = serializers.SerializerMethodField()
    author_url = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    reply_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    has_replies = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'author_url', 'parent', 'object_id',
            'content', 'is_edited', 'like_count', 'reply_count',
            'is_liked', 'can_edit', 'has_replies', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'is_edited', 'created_at', 'updated_at', 'parent', 'object_id']

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'avatar': obj.author.avatar if obj.author.avatar else None
        }

    def get_author_url(self, obj: Comment):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/users/{obj.author.id}/')
        return None
    
    def get_like_count(self, obj: Comment):
        return Like.objects.filter(
            object_id=obj.id
        ).count()

    def get_reply_count(self, obj: Comment):
        return obj.replies.count()

    def get_is_liked(self, obj: Comment):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            content_type = ContentType.objects.get_for_model(obj)
            return Like.objects.filter(
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
    
    def get_has_replies(self, obj):
        return obj.replies.count() > 0

    # def get_replies(self, obj):
    #     if obj.parent is None:
    #         replies = obj.replies.all()[:5]
    #         return CommentSerializer(replies, many=True, context=self.context).data
    #     return []

    def get_replies(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(reverse('interactions:comment_replies', args=[obj.id]))
        return None

class CommentReplySerializer(serializers.ModelSerializer):
    reply = serializers.CharField(write_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'reply'
        ]

    def validate(self, attrs: dict[str, str]):
        if not attrs.get('reply'):
            raise serializers.ValidationError("Reply is required")

        return attrs


class ShareSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    id = serializers.CharField()
    
    class Meta:
        model = Share
        fields = ['id', 'user', 'username', 'message', 'created_at']
        read_only_fields = ['user', 'created_at']