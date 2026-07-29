from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.posts.models import Post

class PostRepository(BaseRepository[Post]):
    model = Post

    def get_queryset(self) -> QuerySet[Post]:
        return (
            super()
            .get_queryset()
            .filter(is_deleted=False)
        )

    def soft_delete(self, instance: Post) -> None:
        return instance.soft_delete()
