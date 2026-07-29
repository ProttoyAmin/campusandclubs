import uuid

from django.db.models import QuerySet
from apps.clubs.models.membership.form.enums import ApplicationStatus
from core.repositories import BaseRepository
from apps.accounts.models import User
from apps.clubs.models import MembershipApplication, Club, Membership


class MembershipApplicationRepository(BaseRepository[MembershipApplication]):
    model = MembershipApplication

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        return super().get_queryset()

    def get_membership_applications(self, club: Club) -> QuerySet[MembershipApplication]:
        return self.get_queryset().filter(club=club).prefetch_related('applicant', 'club', 'membership')

    def get_application(self, club_id: uuid.UUID, application_id: int) -> MembershipApplication:
        return self.get_queryset().select_related("club", "applicant").get(
            club_id=club_id, pk=application_id
        )

    def create_membership_application(self, club: Club, applicant: User, message: str) -> MembershipApplication:
        return self.create(club=club, applicant=applicant, message=message)

    def application_exists(self, club: Club, applicant: User) -> bool:
        return self.exists(club=club, applicant=applicant, status=ApplicationStatus.PENDING)

    