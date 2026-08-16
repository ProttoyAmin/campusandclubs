from apps.institutes.models.choices import AffiliationStatus
from apps.institutes.models import InstituteAffiliate
import uuid
from apps.institutes.models import Institute
from apps.accounts.models import User
from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.institutes.models import AcademicProfile


class AcademicRepository(BaseRepository[AcademicProfile]):
    model = AcademicProfile

    def get_queryset(self) -> QuerySet[AcademicProfile]:
        return super().get_queryset().filter(deleted_at__isnull=True)

    def create(self, user_id: uuid.UUID, email: str, institute_id: uuid.UUID) -> AcademicProfile:
        return super().create(user_id=user_id, email=email, institute_id=institute_id)

    def create_member(
        self,
        member_id: uuid.UUID,
        academic_email: str
    ) -> AcademicProfile:
        """Create new member without email/academic email"""
        return self.model.objects.create(
            member_id=member_id,
            academic_email=academic_email,
        )

    def set_email(self, user_id: uuid.UUID, email: str, institute_id: uuid.UUID) -> AcademicProfile:
        profile = self.get_queryset().filter(user_id=user_id).first()
        if not profile:
            return self.create(user_id=user_id, email=email, institute_id=institute_id)
        return self.update(profile, email=email)

    def set_academic_email(self, affiliate_id: uuid.UUID, academic_email: str) -> AcademicProfile:
        profile = self.get_queryset().filter(member_id=affiliate_id).first()
        if not profile:
            return self.create_member(member_id=affiliate_id, academic_email=academic_email)
        return self.update(profile, academic_email=academic_email)

    def get_by_user(self, user_id: uuid.UUID) -> AcademicProfile:
        return self.get_queryset().filter(user_id=user_id).first()

    def get_by_institute(self, institute_id: uuid.UUID) -> AcademicProfile:
        return self.get_queryset().filter(institute_id=institute_id).first()
