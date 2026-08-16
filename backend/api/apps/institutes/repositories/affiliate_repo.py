from datetime import timedelta
import uuid
from django.utils import timezone
from apps.institutes.models.choices import AffiliationStatus
from typing import Any
from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.institutes.models import InstituteAffiliate


class AffiliateRepository(BaseRepository[InstituteAffiliate]):
    model = InstituteAffiliate

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return super().get_queryset().filter(removed_at__isnull=True)

    def create_affiliation(self, institute_id: uuid.UUID, user_id: uuid.UUID, role: str) -> InstituteAffiliate:
        return self.create(
            institute_id=institute_id,
            user_id=user_id,
            role=role,
            status=AffiliationStatus.PENDING,
            token_expires_at=timezone.now() + timedelta(days=1),
        )

    def claim(self, data: Any) -> InstituteAffiliate:
        return self.model.objects.create(
            institute_id=data.institute_id,
            user_id=data.user_id,
            role=data.role,
            status=AffiliationStatus.PENDING
        )

    def exists_by_user_and_institute(self, user_id: uuid.UUID, institute_id: uuid.UUID) -> bool:
        return self.get_queryset().filter(user_id=user_id, institute_id=institute_id).exists()
