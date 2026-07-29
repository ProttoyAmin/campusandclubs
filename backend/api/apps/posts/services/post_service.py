from django.db.models import QuerySet
from apps.posts.models.post import Post


import logging

from rest_framework.exceptions import PermissionDenied

from core.services import BaseService
from apps.posts.repository import PostRepository
from apps.posts.models import Post
from core.context import RequestContext

logger = logging.getLogger(__name__)


class PostService(BaseService[Post, PostRepository]):
    """
    Post service class.
    """
    repository_class = PostRepository

    def list_posts(self) -> QuerySet[Post]:
        return self.repository.get_queryset()

    def soft_delete(self, instance: Post):
        logger.info("SOFT DELETING POST!!!!!!!", instance)

        if instance.author != self.actor:
            raise PermissionDenied()

        return self.repository.soft_delete(instance)

