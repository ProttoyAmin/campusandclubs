from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.posts.models import Post

class PostRepository(BaseRepository[Post]):
    model = Post

    def get_queryset(self) -> QuerySet[Post]:
        return (
            super()
            .get_queryset()
            .filter(deleted_at__isnull=True)
        )

    def soft_delete(self, instance: Post) -> None:
        return instance.soft_delete()
