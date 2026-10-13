from rest_framework.parsers import FormParser
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import parser_classes
from django.core.exceptions import ValidationError
from apps.media.services.media_service import MediaService
from rest_framework import status
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.generics import ListCreateAPIView
from apps.media.models import Media
from apps.media.serializers import MediaListSerializer, MediaUploadSerializer
from core.views import ServiceMixin


class ListCreateMediaAPIView(ServiceMixin[MediaService], ListCreateAPIView):
    service_class = MediaService
    queryset = Media.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), ]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser(),]


    def get_serializer_class(self) -> type[MediaListSerializer] | type[MediaUploadSerializer]:
        if self.request.method == 'POST':
            return MediaUploadSerializer
        return MediaListSerializer

    def list(self, request, *args, **kwargs):
        from core.services import cloudinary_api

        usage = cloudinary_api.usage()
        print(usage)
        return Response(self.get_serializer(self.get_queryset(), many=True).data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        from apps.media.dtos.media_upload_dto import MediaUploaDTO

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        dto = MediaUploaDTO(
            target_type=serializer.validated_data["target_type"],
            object_id=serializer.validated_data["object_id"],
            role=serializer.validated_data["role"],
            file=serializer.validated_data["file"],
        )

        try:
            media = self.get_service(request).upload_media(dto)
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        output_serializer = MediaListSerializer(media, context=self.get_serializer_context())
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

