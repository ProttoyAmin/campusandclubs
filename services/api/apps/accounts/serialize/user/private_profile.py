from typing import Any

from rest_framework import serializers

from apps.accounts import models
from apps.connections.models import Follow


class PrivateUserSerializer(serializers.ModelSerializer):
    """Minimal, safe-to-expose fields for a private/restricted profile."""

    avatar = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    follow_status = serializers.SerializerMethodField()

    class Meta:
        model = models.User
        fields = [
            "id", "username", "first_name", "last_name", "avatar",
            "following_count", "follower_count", "user_post_count",
            "is_private", "is_following", "follow_status",
        ]

    def get_avatar(self, obj: models.User) -> str | None:
        request = self.context.get("request")
        if request and obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_is_following(self, obj: models.User) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.is_followed_by(request.user)
        return False

    def get_follow_status(self, obj: models.User) -> Any | None:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Follow.get_follow_status(request.user, obj)
        return None