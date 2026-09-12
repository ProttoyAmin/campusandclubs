from rest_framework import status
from django.core.files.uploadedfile import UploadedFile
from typing import Any

from rest_framework.request import Request
from rest_framework.response import Response
from apps.posts.models.post import Post

from django.db.models import QuerySet
from rest_framework import generics

from apps.posts.models import Post
from apps.posts.serializer import PostSerializer, PostCreateSerializer
from apps.posts.services import PostService
from core.views import ServiceMixin
from core.pagination import StandardResultsSetPagination
from rest_framework.parsers import MultiPartParser, FormParser

class PostListCreateView(ServiceMixin[PostService], generics.ListCreateAPIView[Post]):
    service_class = PostService
    pagination_class = StandardResultsSetPagination
    parser_classes = [MultiPartParser, FormParser]


    def get_queryset(self) -> QuerySet[Post]:
        return self.get_service(self.request).list_posts()

    def get_serializer_class(self, *args: Any, **kwargs: Any) -> type[PostCreateSerializer] | type[PostSerializer]:
        if (self.request.method == 'POST'):
            return PostCreateSerializer
        return PostSerializer

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        param = request.query_params.get('media')

        if param == "True":
            queryset = self.get_service(request).list_posts().filter(
                media__isnull=False
            )
            page = self.paginate_queryset(queryset)
            return self.get_paginated_response(PostSerializer(page, many=True).data)
        
        if param == "False":
            queryset = self.get_service(request).list_posts().filter(
                media__isnull=True
            )
            page = self.paginate_queryset(queryset)
            return self.get_paginated_response(PostSerializer(page, many=True).data)
        
        return super().list(request, *args, **kwargs)

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        from django.db import transaction
        from apps.media.models import Media, MediaRole
        from apps.posts.models import Post
        from django.contrib.contenttypes.models import ContentType
        import cloudinary
        from apps.clubs.models import Club

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        media: UploadedFile | None = serializer.validated_data.pop('media')
        clubs: list[Club] = serializer.validated_data.pop('clubs') or []
        content = serializer.validated_data.pop('content')

        upload = None
        if media:
            upload = cloudinary.uploader.upload(
                media, folder=f"posts/{request.user.id}", file_name=media.name
            )

        targets = clubs if clubs else [None]
        posts = []
        with transaction.atomic():
            for club in targets:
                post = Post.objects.create(
                    author=request.user,
                    club=club,
                    content=content,
                )
                if upload:
                    Media.objects.create(
                        content_type=ContentType.objects.get_for_model(post),
                        object_id=post.id,
                        file=upload['public_id'],
                        role=MediaRole.POST,
                    )
                posts.append(post)

        return Response(
            {"message": "Post created successfully", "data": PostSerializer(posts, many=True).data},
            status=status.HTTP_201_CREATED,
        )


class PostUpdateDestroyView(ServiceMixin[PostService], generics.RetrieveUpdateDestroyAPIView[Post]):
    serializer_class = PostSerializer
    service_class = PostService
    lookup_field = 'id'
    lookup_url_kwarg = 'post_id'

    def get_queryset(self) -> QuerySet[Post]:
        return self.get_service(self.request).list_posts()

    # type: ignore[override]
    def perform_destroy(self, instance: Post) -> None:
        self.get_service(self.request).soft_delete(instance)
