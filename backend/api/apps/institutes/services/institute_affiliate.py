from apps.institutes.models.choices import AffiliationStatus
from apps.clubs.models import AffiliateStatus
from apps.institutes.models import InstituteRole
from typing import Any
from apps.institutes.models.institute_affiliate import InstituteAffiliate

from dataclasses import dataclass
import uuid
import logging
from core.services import BaseService
from apps.institutes.repositories import AffiliateRepository
from apps.institutes.models import InstituteAffiliate, Institute
from django.db.models import QuerySet

from apps.institutes.models import AcademicProfile
from apps.accounts.models import User
from apps.institutes.dto.affiliation.create import AffiliateCreateDTO


logger = logging.getLogger(__name__)


class AffiliateService(BaseService[InstituteAffiliate, AffiliateRepository]):
    """Affiliate service class"""
    repository_class = AffiliateRepository

    def create_affiliation(self, data: AffiliateCreateDTO, user_id: uuid.UUID) -> InstituteAffiliate:
        dto = AffiliateCreateDTO(
            institute_id=data["institute"].id,
            user_id=user_id,
            role=data["role"]
        )
        return self.repository.create_affiliation(dto)

    def get(self, id: uuid.UUID) -> InstituteAffiliate:
        return self.repository.get_queryset().get(id=id)

    def list(self) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset()

    def list_pending_affiliates(self, id: uuid.UUID) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset().filter(id=id, status=AffiliateStatus.PENDING)

    def list_active_affiliates(self, id: uuid.UUID) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset().filter(id=id, status=AffiliateStatus.ACTIVE)

    def list_rejected_affiliates(self, id: uuid.UUID) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset().filter(id=id, status=AffiliateStatus.REJECTED)

    def list_left_affiliates(self, id: uuid.UUID) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset().filter(id=id, status=AffiliateStatus.LEFT)

    def list_banned_affiliates(self, id: uuid.UUID) -> QuerySet[InstituteAffiliate]:
        return self.repository.get_queryset().filter(id=id, status=AffiliateStatus.BANNED)

    def roles(self) -> QuerySet[InstituteRole]:
        return InstituteRole.choices()

    def claim(self, data: dict, user_id: uuid.UUID) -> AcademicProfile:
        """Claim affiliation"""
        from apps.communications.services.email.email_service import EmailService
        from apps.institutes.repositories import AcademicRepository

        academic_repo = AcademicRepository()
        logger.info("Data: ", data)

        institute = data.get("institute")
        role = data.get("role")
        email = data.get("email")
        professional_email = email.email
        logger.info("Claiming affiliation: institute=%s role=%s user_id=%s",
                    institute.id, role, user_id)

        exists = self.repository.exists_by_user_and_institute(
            user_id, institute.id)
        if exists:
            raise ValueError("You are already affiliated with this institute.")

        affiliate = self.repository.create_affiliation(
            institute.id, user_id, role)
        logger.info("Affiliate created: %s", affiliate.id)
        logger.info("Affiliate: ", affiliate)

        academic_profile = academic_repo.set_academic_email(
            affiliate.id, professional_email)
        logger.info("Academic profile: %s", academic_profile.id)

        EmailService().send_affiliate_confirmation_email(
            affiliate, academic_profile.academic_email)
        return academic_profile

    def has_valid_token(self, token: uuid.UUID) -> bool:
        """Verify token"""
        from django.utils import timezone

        affiliate = self.repository.get(verification_token=token)
        if not affiliate:
            raise ValueError("Affiliate not found.")

        if timezone.now() > affiliate.token_expires_at:
            return False

        return True

    def is_verified(self, token: uuid.UUID) -> bool:
        """Check if affiliation is verified"""
        from django.utils import timezone

        affiliate = self.repository.get(verification_token=token)
        if not affiliate:
            raise ValueError("Affiliate not found.")

        return affiliate.status == AffiliationStatus.VERIFIED and affiliate.verified_at != None

    def verify_affiliation(self, token: uuid.UUID) -> InstituteAffiliate:
        """Verify affiliation"""
        from django.utils import timezone

        affiliate = self.repository.get(verification_token=token)
        if not affiliate:
            raise ValueError("Affiliate not found.")

        if self.is_verified(token):
            raise ValueError("Affiliate is already verified.")

        if not self.has_valid_token(token):
            raise ValueError("Affiliate token has expired.")

        affiliate.status = AffiliationStatus.VERIFIED
        affiliate.verified_at = timezone.now()
        affiliate.save()
        return affiliate
