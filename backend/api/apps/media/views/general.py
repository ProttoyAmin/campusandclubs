from django.db import transaction
from django.db.models import Max
from rest_framework import permissions, status
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response

from apps.media.models import Media
from apps.media.serializers import MediaListSerializer, MediaUploadSerializer


class ListCreateMediaAPIView(ListCreateAPIView):
    """List or upload media.

    Supports both single-file uploads (legacy ``file`` field - kept for
    backward compatibility with older clients) and multi-file uploads via
    ``file`` (a list of UploadedFile).
    """

    permission_classes = [permissions.IsAuthenticated]
    queryset = Media.objects.all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MediaUploadSerializer
        return MediaListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data.pop("target_type")

        # Normalize to a list of files.
        files = data.pop("file", None) or []
        single = data.pop("single_file", None)
        if single is not None:
            files = [single, *files] if isinstance(files, list) else [single]
        if not isinstance(files, list):
            files = [files]

        role = data.get("role", "attachment")
        with transaction.atomic():
            last_position = (
                Media.objects
                .select_for_update()
                .filter(content_type=data["content_type"], object_id=data["object_id"], role=role)
                .aggregate(Max("position"))["position__max"]
            )
            next_pos = 0 if last_position is None else last_position + 1
            created = []
            for idx, f in enumerate(files):
                media = Media.objects.create(
                    **data,
                    file=f,
                    position=next_pos + idx,
                    original_file_name=getattr(f, "name", "") or "",
                )
                created.append(media)

        output = MediaListSerializer(created, many=True, context=self.get_serializer_context()).data
        if len(created) == 1:
            return Response(output[0], status=status.HTTP_201_CREATED)
        return Response(output, status=status.HTTP_201_CREATED)

        