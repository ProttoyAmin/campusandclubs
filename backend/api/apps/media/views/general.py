from rest_framework import status
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView
from apps.media.models import Media
from apps.media.serializers import MediaListSerializer, MediaUploadSerializer


class ListCreateMediaAPIView(ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Media.objects.all()


    def get_serializer_class(self) -> type[MediaListSerializer] | type[MediaUploadSerializer]:
        if self.request.method == 'POST':
            return MediaUploadSerializer
        return MediaListSerializer

    def create(self, request, *args, **kwargs):
        from django.db import transaction
        from django.db.models import Max
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = dict(serializer.validated_data)
        data.pop("target_type")

        with transaction.atomic():
            last_position = (
                Media.objects
                .select_for_update()
                .filter(content_type=data["content_type"], object_id=data["object_id"], role=data["role"])
                .aggregate(Max("position"))["position__max"]
            )
            data["position"] = 0 if last_position is None else last_position + 1
            media = Media.objects.create(**data)

        output_serializer = MediaListSerializer(media, context=self.get_serializer_context())
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

        