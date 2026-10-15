from apps.clubs.dtos.invite_dto import InviteUsageDTO
from apps.accounts.models import User
from apps.clubs.models.enums import InviteStatus
from django.db.models import QuerySet
from apps.clubs.dtos.invite_dto import InviteDTO
from apps.clubs.dtos.invite_dto import InviteAttrs
from apps.clubs.models import Invite, InviteUsage
from core.repositories import BaseRepository
from django.utils import timezone
from django.db.models import F
from typing import Any

class InviteUsageRepository(BaseRepository[InviteUsage]):
    model = InviteUsage

    def create(self, dto: InviteUsageDTO) -> InviteUsage:
        return self.model.objects.create(
            invite=dto.invite,
            user=dto.user,
            ip_address=dto.ip_address,
            user_agent=dto.user_agent,
            used_at=dto.used_at
        )

    def get_or_none(self, invite: Invite, user: User) -> InviteUsage | None:
        try:
            return self.model.objects.get(invite=invite, user=user)
        except self.model.DoesNotExist:
            return None

    def exists(self, invite: Invite, user: User) -> bool:
        return self.model.objects.filter(invite=invite, user=user).exists()