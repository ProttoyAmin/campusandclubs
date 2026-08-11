from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.posts.models import Post
from apps.interactions.models import (
    Comment, 
    Like, 
    Share
)
from apps.posts.serializer import PostMediaSerializer


class PostCreateSerializer(serializers.ModelSerializer):
    content = serializers.CharField()
    media = PostMediaSerializer(many=True, required=False)


    class Meta:
        model = Post
        fields = [
            'id',
            'content',
            'media',
        ]
