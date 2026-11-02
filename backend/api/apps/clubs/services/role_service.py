import uuid
from django.db.models import QuerySet
from apps.clubs.models.enums import JoinMethod
from core.constants import DEFAULT_MEMBER_COLOR
from core.constants import DEFAULT_MEMBER_ROLE
from apps.clubs.models import Role
from rest_framework.request import Request
from django.utils import timezone
from apps.clubs.dtos.invite_dto import InviteUsageDTO
from apps.clubs.repositories.invite.invite_usage_repo import InviteUsageRepository
from apps.clubs.repositories import MembershipRepository
from typing import Optional
from apps.clubs.models.utils import default_invite_expires_at
from apps.clubs.models.enums import InviteStatus
from apps.clubs.models.enums import InviteType
from django.core.exceptions import PermissionDenied
from apps.clubs.policies.club import ClubPolicy
from core.views import PolicyMixin
from apps.clubs.models import Club
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from apps.clubs.dtos.invite_dto import InviteDTO
from apps.clubs.dtos.invite_dto import InviteAttrs
from apps.accounts.models import User
from apps.clubs.models import Role
from core.services import BaseService
from apps.clubs.repositories.role.role_repo import RoleRepository
import logging

logger = logging.getLogger(__name__)

class RoleService(BaseService[Role, RoleRepository]):
    repository_class = RoleRepository

    def __init__(
        self,
        actor: Optional[User] = None,
        repository: Optional[RoleRepository] = None,
    ) -> None:
        super().__init__(actor, repository)
        self.membership_repo = MembershipRepository()
        self.usage_repo = InviteUsageRepository()

    def _get_object(self, pk: uuid.UUID) -> Club:
        return self.repository.get(pk=pk)
    
    def list_roles(self, club_pk: str) -> QuerySet[Role]:
        return self.repository.list_roles(club_pk=club_pk)

    def assign_role(self, member_ids: list[str], role_id: str):
        members = self.membership_repo.filter(user__id__in=member_ids)

        if len(members) != len(member_ids):
            raise ValidationError(f"Member outside club has been selected")

        exists = []
        for member in members:
            if member.roles.filter(pk=role_id).exists():
                exists.append(member.id)
        
        raise ValidationError(f"Already exists {len(exists)}")