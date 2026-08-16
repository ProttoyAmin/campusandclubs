from apps.institutes.models import InstituteAffiliate
from typing import Any
import uuid
from core.services import BaseService
from apps.institutes.repositories import InstituteRepository
from apps.institutes.models import Institute
from django.db.models import QuerySet
from apps.accounts.models import User
from apps.institutes.repositories import AffiliateRepository


class InstituteService(BaseService[Institute, InstituteRepository]):
    """Institute service class"""
    repository_class = InstituteRepository
    affiliate_repo_class = AffiliateRepository

    def list_institutes(self) -> QuerySet[Institute]:
        return self.repository.get_queryset()

    def get_institute(self, id: int) -> Institute:
        return self.repository.get(id=id)

    def get_distinct_affiliate_institutes(self, user: User) -> QuerySet[Institute]:
        return self.repository.get_distinct(user=user)

    def claim_affiliation(self, data: Any):
        """Claim affiliation"""
        return self.affiliate_repo_class().claim(data)
