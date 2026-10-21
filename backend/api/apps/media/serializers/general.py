from apps.media.services.media_service import TARGET_TYPE_MAP
from apps.media.dtos.media_upload_dto import MediaUploadAttrs
from apps.media.models import MediaRole
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
import cloudinary

from apps.media.models import Media

class MediaUploadSerializer(serializers.Serializer):
    target_type = serializers.ChoiceField(choices=list(TARGET_TYPE_MAP.keys()), write_only=True)
    object_id = serializers.UUIDField(write_only=True)
    role = serializers.ChoiceField(choices=MediaRole.choices, write_only=True)
    file = serializers.FileField(write_only=True)
    # position = serializers.IntegerField(read_only=True)

    class Meta:
        # model = Media
        fields = ["target_type", "object_id", "role", "file", "position"]
        read_only_fields = ["position"]

    def validate(self, attrs: MediaUploadAttrs):
        model_class = TARGET_TYPE_MAP[attrs["target_type"]]

        # if not model_class.objects.filter(pk=attrs["object_id"]).exists():
        #     raise serializers.ValidationError({"object_id": f"No {attrs['target_type']} found with this id."})

        attrs["content_type"] = ContentType.objects.get_for_model(model_class)
        return attrs


class MediaListSerializer(serializers.ModelSerializer):
    # file = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        model = Media
        # fields = [
        #     "id",
        #     "target",
        #     "original_file_name",
        #     "bytes",
        #     "mime_type",
        #     "format",
        #     "duration",
        #     "secure_url",
        #     "role",
        #     "position",
        #     "public_id",
        #     "resource_type",
        #     "version",
        #     "target",
        # ]
        fields = "__all__"
        # read_only_fields = ["id", "position", "role", "target", "original_file_name", "bytes", "mime_type", "format", "secure_url", "public_id", "resource_type", "type", "version",]

    # def get_file(self, obj: Media):
    #     from cloudinary import CloudinaryResource
        # file: CloudinaryResource = obj.file
        # return {
        #     "url": file.url if file.url else None,
        #     "public_id": file.public_id,
        #     "resource_type": file.resource_type,
        #     "type": file.type,
        #     "version": file.version,
        #     "format": file.format,
        #     "secure_url": file.source(secure=True) if file.url else None
        # }

    def get_target(self, obj: Media):
        from apps.clubs.serializer import ClubSerializer
        from apps.accounts.serialize.user import UserProfileSerializer
        from apps.posts.serializer import PostSerializer

        # serializer_map = {
        #     "club": ClubSerializer,
        #     "user": UserProfileSerializer,
        #     "post": PostSerializer,
        # }

        # serializer_class = serializer_map.get(obj.content_type.model)
        # if serializer_class is None or obj.content_object is None:
        #     return None

        # return serializer_map[obj.content_type.model](obj.content_object, context=self.context).data
        return {
            "id": obj.content_object.id,
            "model": obj.content_object.__class__.__name__
        }

        