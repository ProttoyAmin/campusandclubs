import uuid
from django.db.models import QuerySet
from apps.accounts.models import User
from core.repositories import BaseRepository
from apps.institutes.models import Institute

class InstituteRepository(BaseRepository[Institute]):
    model = Institute

    def get_queryset(self) -> QuerySet[Institute]:
        return super().get_queryset().filter(deleted_at__isnull=True)

    def get_distinct(self, user: User) -> QuerySet[Institute]:
        return self.get_queryset().filter(affiliates__user=user, affiliates__isnull=False).distinct()
