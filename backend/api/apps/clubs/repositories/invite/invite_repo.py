from apps.clubs.models.enums import InviteStatus
from django.db.models import QuerySet
from apps.clubs.dtos.invite_dto import InviteDTO
from apps.clubs.dtos.invite_dto import InviteAttrs
from apps.clubs.models import Invite
from core.repositories import BaseRepository
from django.utils import timezone
from django.db.models import F

class InviteRepository(BaseRepository[Invite]):
    model = Invite

    def create(self, dto: InviteDTO) -> Invite:
        return self.model.objects.create(
            created_by=dto.created_by,
            invite_type=dto.invite_type,
            club=dto.club,
            event=dto.event,
            message=dto.message,
            expires_at=dto.expires_at,
            status=dto.status,
            code=dto.code
        )

    def list(self, club_id: str) -> QuerySet[Invite]:
        return self.filter(club__id=club_id)

    def accept(self, code: str) -> Invite:
        self.model.objects.filter(code=code).update(
            responded_at=timezone.now()
        )
        return self.model.objects.get(code=code)

    def update_uses(self, code: str) -> None:
        self.model.objects.filter(code=code).update(uses=F('uses') + 1)

    def pause(self, code: str) -> Invite:
        return self.model.objects.filter(code=code).update(
            status=InviteStatus.PAUSED
        )

    def update_status(self, code: str, status: InviteStatus) -> Invite:
        return self.model.objects.filter(code=code).update(status=status)

    def revoke(self, code: str) -> Invite:
        return self.model.objects.filter(code=code).update(
            status=InviteStatus.CANCELLED
        )