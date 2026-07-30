from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.institutes.models import InstituteAffiliate
from apps.institutes.dto.affiliation.create import AffiliateCreateDTO

class AffiliateRepository(BaseRepository[InstituteAffiliate]):
    model = InstituteAffiliate

    def get_queryset(self) -> QuerySet[InstituteAffiliate]:
        return super().get_queryset().filter(deleted_at__isnull=True)

    def create_affiliation(self, data: AffiliateCreateDTO) -> InstituteAffiliate:
        return self.create(
            institute_id=data.institute_id,
            user_id=data.user_id,
            role=data.role
        )
