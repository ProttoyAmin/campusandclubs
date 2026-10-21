from apps.clubs.models import FormSubmission
import uuid

from django.db.models import QuerySet
from apps.clubs.models.membership.form.enums import ApplicationStatus
from core.repositories import BaseRepository
from apps.accounts.models import User
from apps.clubs.models import MembershipApplication, Club, Membership, ApplicationStatus


class MembershipApplicationRepository(BaseRepository[MembershipApplication]):
    model = MembershipApplication

    def get_queryset(self) -> QuerySet[MembershipApplication]:
        return (
            super()
            .get_queryset()
            .select_related(
                "applicant",
                "club",
                "submission",
                "submission__form",
                "reviewed_by",
            )
            .prefetch_related(
                "submission__answers",
                "submission__answers__question",
                "membership",
            )
        )

    def get_membership_applications(self, club: Club) -> QuerySet[MembershipApplication]:
        return self.get_queryset().filter(club=club)

    def get_application(
        self, club_id: uuid.UUID, application_id: uuid.UUID
    ) -> MembershipApplication:
        return self.get_queryset().get(club_id=club_id, pk=application_id)
    
    def get_membership_application_for_user(self, club: Club, applicant: User) -> MembershipApplication | None:
        return self.get_queryset().filter(
            club=club, applicant=applicant, status=ApplicationStatus.PENDING
        ).first()

    def create_membership_application(
        self,
        club: Club,
        applicant: User,
        *,
        message: str | None = None,
        submission: FormSubmission | None = None,
    ) -> MembershipApplication:
        return self.create(
            club=club,
            applicant=applicant,
            message=message,
            submission=submission,
        )

    def application_exists(self, club: Club, applicant: User) -> bool:
        return self.exists(club=club, applicant=applicant, status=ApplicationStatus.PENDING)

    