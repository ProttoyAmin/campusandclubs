import logging
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser
from typing import Optional
from django.db import transaction
from django.db.models import QuerySet
from django.views.generic.dates import timezone_today
from rest_framework.exceptions import ValidationError

from apps.clubs.models import Membership, ApplicationStatus
from apps.clubs.repositories.form import FormRepository
from core.services import BaseService
from apps.clubs.models import Club, Visibility, MembershipApplication
from apps.clubs.repositories.club.club_repo import ClubRepository
from apps.clubs.dtos import ClubListFilters
from apps.clubs.repositories.role.role_repo import RoleRepository
from apps.clubs.repositories import MembershipRepository, MembershipApplicationRepository

from apps.accounts.models import User

logger = logging.getLogger(__name__)

class ClubService(BaseService[Club, ClubRepository]):
    """Club service class for managing club operations"""

    repository_class = ClubRepository

    def __init__(
        self,
        actor: Optional[AbstractBaseUser] = None,
        repository: Optional[ClubRepository] = None,
    ) -> None:
        super().__init__(actor, repository)
        self.role_repository = RoleRepository()
        self.membership_repository = MembershipRepository()
        self.membership_application_repository = MembershipApplicationRepository()
        self.form_repository = FormRepository()



    def list_clubs(self, viewer, filters: ClubListFilters) -> QuerySet[Club]:
        clubs = (
            self.repository.joined_by(viewer)
            if filters.joined
            else self.repository.visible_to(viewer)
        )

        if filters.search:
            clubs = self.repository.search(clubs, filters.search)

        if filters.privacy in Visibility.values:
            clubs = clubs.filter(privacy=filters.privacy)

        if filters.origin:
            clubs = clubs.filter(origin=filters.origin)

        return self.repository.with_list_annotations(clubs, viewer)

    def create_club(self, owner: User, **validated_data) -> Club:
        with transaction.atomic():
            club = self.repository.create(
                owner=owner,
                **validated_data
            )

            role = self.role_repository.get_or_create_default_owner_role(club)
            membership = self.membership_repository.create(user=owner, club=club)
            self.membership_repository.add_role(membership, role, set_as_primary=True)
        
        return club

    def get_club_detail(self, club_pk, viewer: User) -> Club:
        return self.repository.with_list_annotations(self.repository.get_queryset().filter(pk=club_pk), viewer).get()

    def join_club(self, club: Club, user: User) -> Membership:
        return self.membership_repository.create_membership(club, user)

    def apply_to_club(self, club: Club, user: User, message: str) -> MembershipApplication:

        if self.membership_application_repository.application_exists(club, user):
            raise ValidationError({"detail": "You already have a pending application for this club."})

        return self.membership_application_repository.create_membership_application(club, user, message)

    def get_membership_applications(self, club: Club) -> QuerySet[MembershipApplication]:
        return self.membership_application_repository.get_membership_applications(club)

    def approve_application(self, application: MembershipApplication, reviewer: User) -> MembershipApplication:
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError({"detail": "Only a pending application can be approved."})

        application.status = ApplicationStatus.APPROVED
        application.reviewed_by = reviewer
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "reviewed_by", "reviewed_at"])

        default_role = application.club.roles.filter(is_default=True).first()
        membership = Membership.objects.create(user=application.applicant, club=application.club, application=application)
        if default_role:
            membership.add_role(default_role, set_as_primary=True)

        return application

    def reject_application(self, application: MembershipApplication, reviewer: User) -> MembershipApplication:
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError({"detail": "Only a pending application can be rejected."})

        application.status = ApplicationStatus.REJECTED
        application.reviewed_by = reviewer
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "reviewed_by", "reviewed_at"])
        return application

    def withdraw_application(self, application: MembershipApplication) -> MembershipApplication:
        application.status = ApplicationStatus.WITHDRAWN
        application.save(update_fields=["status"])
        return application
