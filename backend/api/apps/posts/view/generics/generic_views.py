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


class PostListCreateView(ServiceMixin[PostService], generics.ListCreateAPIView[Post]):
    service_class = PostService

    def get_queryset(self) -> QuerySet[Post]:
        return self.get_service(self.request).list_posts()

    def get_serializer_class(self, *args: Any, **kwargs: Any) -> type[PostCreateSerializer] | type[PostSerializer]:
        if (self.request.method == 'POST'):
            return PostCreateSerializer
        return PostSerializer

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        from apps.media.models import Media, MediaRole
        from apps.posts.models import Post
        from django.contrib.contenttypes.models import ContentType
        import cloudinary

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        media = serializer.validated_data.pop('media')

        post = Post.objects.create(
            author=request.user,
            content=serializer.validated_data.pop('content'),
        )

        if media:
            upload = cloudinary.uploader.upload(
                media, folder=f"posts/{post.id}", file_name=media.name)
            Media.objects.create(
                content_type=ContentType.objects.get_for_model(post),
                object_id=post.id,
                file=upload['url'],
                role=MediaRole.POST,
            )

        response = PostSerializer(post).data
        return Response({"message": "Post created successfully", 'data': response})


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
