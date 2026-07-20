import logging
from django.contrib.auth.base_user import AbstractBaseUser
from typing import Optional
from django.db import transaction
from django.db.models import QuerySet

from core.services import BaseService
from apps.clubs.models import Club, Visibility
from apps.clubs.repositories.club.club_repo import ClubRepository
from apps.clubs.dtos import ClubListFilters
from apps.clubs.repositories.role.role_repo import RoleRepository
from apps.clubs.repositories.membership.membership_repo import MembershipRepository

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

    def get_club_detail(self, club_pk, viewer: User) -> QuerySet[Club]:
        return self.repository.with_list_annotations(self.repository.get_queryset().filter(pk=club_pk), viewer)
