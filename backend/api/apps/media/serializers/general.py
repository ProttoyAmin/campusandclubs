from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
import cloudinary

from apps.media.models import Media

from apps.clubs.models import Club
from apps.accounts.models import User
from apps.posts.models import Post


TARGET_TYPE_MAP = {
    "club": Club,
    "user": User,
    "post": Post,
}

class MediaUploadSerializer(serializers.ModelSerializer):
    target_type = serializers.ChoiceField(choices=list(TARGET_TYPE_MAP.keys()), write_only=True)
    object_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Media
        fields = ["id", "target_type", "object_id", "role", "file", "position"]
        read_only_fields = ["id", "position"]

    def validate(self, attrs):
        model_class = TARGET_TYPE_MAP[attrs["target_type"]]

        if not model_class.objects.filter(pk=attrs["object_id"]).exists():
            raise serializers.ValidationError({"object_id": f"No {attrs['target_type']} found with this id."})

        attrs["content_type"] = ContentType.objects.get_for_model(model_class)
        return attrs


class MediaListSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    # target = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ["id", "file", "position", "role"]

    def get_file(self, obj: Media):
        return {
            "url": obj.file.url,
            "public_id": obj.file.public_id,
            "resource_type": obj.file.resource_type,
        }

    # def get_target(self, obj: Media):
    #     from apps.clubs.serializer import ClubSerializer
    #     from apps.accounts.serialize.user import UserProfileSerializer
    #     from apps.posts.serializer import PostSerializer

    #     serializer_map = {
    #         "club": ClubSerializer,
    #         "user": UserProfileSerializer,
    #         "post": PostSerializer,
    #     }

    #     serializer_class = serializer_map.get(obj.content_type.model)
    #     if serializer_class is None or obj.content_object is None:
    #         return None

    #     return serializer_class(obj.content_object, context=self.context).data