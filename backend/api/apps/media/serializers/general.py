from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.media.models import Media
from apps.realtime.models import Message
from apps.clubs.models import Club
from apps.accounts.models import User
from apps.posts.models import Post


TARGET_TYPE_MAP = {
    "club": Club,
    "user": User,
    "post": Post,
    "message": Message,
}


class MediaUploadSerializer(serializers.ModelSerializer):
    target_type = serializers.ChoiceField(
        choices=list(TARGET_TYPE_MAP.keys()), write_only=True,
    )
    object_id = serializers.UUIDField(write_only=True)
    # allow multiple files in a single request (e.g. image gallery)
    file = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False,
    )
    # single-file upload (kept for backwards compatibility)
    single_file = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Media
        fields = [
            "id", "target_type", "object_id", "role",
            "file", "single_file", "position",
        ]
        read_only_fields = ["id", "position"]

    def validate(self, attrs):
        model_class = TARGET_TYPE_MAP[attrs["target_type"]]
        if not model_class.objects.filter(pk=attrs["object_id"]).exists():
            raise serializers.ValidationError(
                {"object_id": f"No {attrs['target_type']} found with this id."}
            )
        has_files = bool(attrs.get("file")) or bool(attrs.get("single_file"))
        if not has_files:
            raise serializers.ValidationError(
                {"file": "At least one file is required."}
            )
        attrs["content_type"] = ContentType.objects.get_for_model(model_class)
        return attrs


class MediaListSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ["id", "file", "position", "role", "target", "original_file_name"]
        read_only_fields = fields

    def get_file(self, obj: Media):
        resource = obj.file
        return {
            "url": resource.url,
            "public_id": resource.public_id,
            "resource_type": resource.resource_type,
            "type": resource.type,
            "version": resource.version,
            "format": resource.format,
            "secure_url": resource.source(secure=True),
        }

    def get_target(self, obj: Media):
        return {
            "id": obj.content_object.id,
            "model": obj.content_object.__class__.__name__,
        }
