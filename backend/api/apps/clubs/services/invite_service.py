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
from apps.clubs.models import Invite
from core.services import BaseService
from apps.clubs.repositories.invite.invite_repo import InviteRepository
import logging

logger = logging.getLogger(__name__)

class InviteService(BaseService[Invite, InviteRepository], PolicyMixin[ClubPolicy, Club]):
    repository_class = InviteRepository
    policy_class = ClubPolicy

    def __init__(
        self,
        actor: Optional[User] = None,
        repository: Optional[InviteRepository] = None,
    ) -> None:
        super().__init__(actor, repository)
        self.membership_repo = MembershipRepository()
        self.usage_repo = InviteUsageRepository()

    def create(self, attrs: InviteAttrs):
        club = get_object_or_404(Club, id=attrs['club_id'], deleted_at__isnull=True)

        if not club:
            raise ValidationError({'detail': 'Club not found'})

        if attrs.get('invite_type') != InviteType.CLUB and not attrs.get('event_id'):
            raise ValidationError({'detail': 'Event ID is required for event invites'})

        policy = self.get_policy(self.actor, club).can_edit()

        if not policy.allowed:
            raise PermissionDenied(f'{policy.reason}')

        data = InviteDTO(
            invite_type=attrs.get('invite_type'),
            club=club,
            event=attrs.get('event_id') if attrs.get('event_id') else None,
            message=attrs.get('message'),
            created_by=self.actor,
            status=InviteStatus.ONGOING,
            expires_at=default_invite_expires_at(30),
            code=Invite.generate_code()
        )
        try:
            invite = self.repository.create(data)
        except Exception as e:
            logger.error(f'Invite created failed by {self.actor} for club {club} with error {e}')
            raise ValidationError({'detail': f'Invite created failed {e}'})

        logger.info(f'Invite created successfully by {self.actor} for club {club} with code {invite.code}')
        
        return self.repository.get(pk=invite.pk)

    def accept_invite(self, code: str, request: Request) -> Invite:
        invite = self.repository.get(code=code)
        
        logger.info(f'invite {invite}')
        logger.info(f'invite {code}')
        logger.info(f'invite {request}')

        if not invite:
            raise ValidationError({'detail': 'Invite not found'})

        if invite.is_expired:
            raise ValidationError({'detail': 'This invite has expired'})

        if invite.max_uses and invite.uses >= invite.max_uses:
            raise ValidationError({'detail': 'This invite has reached its maximum uses'})

        if invite.invite_type == InviteType.CLUB:
            membership = self.get_policy(self.actor, invite.club).membership_exists()
            if membership:
                raise ValidationError({'detail': f'You are already a member of {invite.club.name}'})

        if self.usage_repo.exists(invite=invite, user=self.actor):
            raise ValidationError({'detail': 'Invite already used'})

        dto = InviteUsageDTO(
            invite=invite,
            user=self.actor,
            ip_address=request.META.get('REMOTE_ADDR') or '',
            user_agent=request.META.get('HTTP_USER_AGENT') or '',
            used_at=timezone.now()
        )

        logger.info(f'IP : {request.META.get("REMOTE_ADDR")}')
        logger.info(f'User Agent : {request.META.get("HTTP_USER_AGENT")}')
        logger.info(f'DTO : {dto}')

        self.usage_repo.create(dto)
        self.repository.update_uses(code)

        if invite.invite_type == InviteType.CLUB:
            self.membership_repo.create_membership_from_invite(invite.club, self.actor, join_method=JoinMethod.INVITE)
            # default_role = Role.objects.create(
            #     club=invite.club,
            #     name=DEFAULT_MEMBER_ROLE,
            #     is_default=True,
            #     color=DEFAULT_MEMBER_COLOR
            # )

            # if default_role:
            #     self.membership_repo.add_role(new_membership, default_role, set_as_primary=True)

        return self.repository.accept(code)

    def get_by_code(self, code: str) -> Invite:
        invite = self.repository.get(code=code)
        if not invite:
            raise ValidationError({'detail': 'Invite not found'})

        # if invite.is_expired:
        #     raise ValidationError({'detail': 'This invitation is expired'})

        # if invite.status == InviteStatus.PAUSED:
        #     raise ValidationError({'detail': 'This invitation is paused'})

        return invite

    def update_invite_status(self, code: str, status: InviteStatus) -> Invite:
        invite = self.repository.get(code=code)

        if not invite.created_by.id == self.actor.id:
            raise PermissionDenied(f'You are not authorized to pause this invitation')

        if invite.status == InviteStatus.EXPIRED or invite.is_expired:
            raise ValidationError(f'This invitation is expired')
        
        if invite.status == status:
            raise ValidationError(f'This invitation is already {status}')

        return self.repository.update_status(invite.code, status)

    def remove_invite(self, code: str) -> Invite:
        invite = self.repository.get(code=code)

        if not invite:
            raise ValidationError({'detail': 'Invite not found'})

        if invite.created_by.id != self.actor.id:
            raise PermissionDenied(f'You are not authorized to remove this invitation')

        return self.repository.delete(invite)