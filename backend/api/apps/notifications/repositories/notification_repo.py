from django.db.models import QuerySet
from django.db.models import Q

from core.repositories import BaseRepository
from apps.notifications.models import Notification
from django.contrib.contenttypes.prefetch import GenericPrefetch
from apps.notifications.models.enums import NotificationVerb
from apps.interactions.models import Like, Comment
from apps.posts.models import Post


class NotificationRepository(BaseRepository):
    model = Notification

    def get_user_notifications(self, user) -> QuerySet[Notification]:
        """Get all notifications for a user"""
        return self.filter(
            recipient=user
        ).select_related(
            'target_ct'
        ).prefetch_related(
            'actors__actor',
            GenericPrefetch('target', [Post.objects.all(), Comment.objects.all()])
        ).order_by('-created_at')

    def get_follow_request_notifications(self, user) -> QuerySet[Notification]:
        """Get all follow request notifications for a user"""
        return self.filter(
            recipient=user,
            verb=NotificationVerb.FOLLOW_REQUEST
        ).select_related(
            'target_ct'
        ).prefetch_related(
            'actors__actor',
            GenericPrefetch('target', [Post.objects.all(), Comment.objects.all()])
        ).order_by('-created_at')