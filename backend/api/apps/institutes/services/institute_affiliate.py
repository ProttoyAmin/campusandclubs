from typing import Any
from apps.institutes.models.institute_affiliate import InstituteAffiliate


from dataclasses import dataclass
import uuid
from core.services import BaseService
from apps.institutes.repositories import AffiliateRepository
from apps.institutes.models import InstituteAffiliate, Institute
from django.db.models import QuerySet

from apps.accounts.models import User
from apps.institutes.dto.affiliation.create import AffiliateCreateDTO


class AffiliateService(BaseService[InstituteAffiliate, AffiliateRepository]):
    """Affiliate service class"""
    repository_class = AffiliateRepository

    def create_affiliation(self, data: dict[str, Any], user_id: uuid.UUID) -> InstituteAffiliate:
        dto = AffiliateCreateDTO(
            institute_id=data["institute"].id,
            user_id=user_id,
            role=data["user_type"]
        )
        return self.repository.create_affiliation(dto)
