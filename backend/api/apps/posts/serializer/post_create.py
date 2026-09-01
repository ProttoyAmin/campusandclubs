from typing import Any
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
    media = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'content',
            'media',
        ]
