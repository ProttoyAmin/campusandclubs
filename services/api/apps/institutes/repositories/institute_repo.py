from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.institutes.models import Institute

class InstituteRepository(BaseRepository[Institute]):
    model = Institute

    def get_queryset(self) -> QuerySet[Institute]:
        return super().get_queryset().filter(deleted_at__isnull=True)
