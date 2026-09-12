from apps.clubs.dtos import ClubListFilters
from core.policies.utils import current_user
from requests import Request
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
from apps.posts.dtos.createpostdto import PostCreateAttrs
from apps.clubs.models import Club

class PostCreateSerializer(serializers.Serializer):
    content = serializers.CharField(required=False, allow_null=True)
    media = serializers.FileField(required=False, allow_null=True)
    clubs = serializers.PrimaryKeyRelatedField(
        queryset=Club.objects.all(),
        required=False,
        allow_null=True,
        many=True
    )

    class Meta:
        # model = Post
        fields = [
            # 'id',
            'content',
            'media',
            'clubs',
        ]

    def _get_request(self) -> Request | None:
        return self.context.get('request')

    def __init__(self, *args, **kwargs):
        # Importing inside the method to avoid circular imports
        from apps.clubs.services.club.club_service import ClubService
        from apps.clubs.repositories import ClubRepository
        super().__init__(*args, **kwargs)
        # self._club_repository = ClubRepository()
        club_service: ClubService = ClubService()
        if self._get_request() and self._get_request().user.is_authenticated:
            self.fields['clubs'].child_relation.queryset = club_service.list_clubs(current_user(self._get_request()), filters=ClubListFilters(joined=True))

    def validate(self, attrs: PostCreateAttrs) -> PostCreateAttrs:
        if not attrs.get('content') and not attrs.get('media'):
            raise serializers.ValidationError("Content or Media is required")

        return PostCreateAttrs(
            content=attrs.get('content'),
            media=attrs.get('media'),
            clubs=attrs.get('clubs'),
        )
