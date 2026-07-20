from apps.posts.models.post import Post

from django.db.models import QuerySet
from rest_framework import generics

from apps.posts.models import Post
from apps.posts.serializer import PostSerializer
from apps.posts.services import PostService
from core.views import ServiceMixin

class PostListCreateView(ServiceMixin[PostService], generics.ListCreateAPIView):
    serializer_class = PostSerializer
    service_class = PostService

    def get_queryset(self) -> QuerySet[Post]:
        return self.get_service(self.request).list_posts()


class PostUpdateDestroyView(ServiceMixin[PostService], generics.RetrieveUpdateDestroyAPIView[Post]):
    serializer_class = PostSerializer
    service_class = PostService
    lookup_field = 'id'
    lookup_url_kwarg = 'post_id'

    def get_queryset(self) -> QuerySet[Post]:
        return self.get_service(self.request).list_posts()

    def perform_destroy(self, instance: Post) -> None:          # type: ignore[override]
        self.get_service(self.request).soft_delete(instance)