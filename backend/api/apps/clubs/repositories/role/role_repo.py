from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.clubs.models.permission import ClubPermission
from apps.clubs.models import Role, Club
from core.constants import DEFAULT_MEMBER_ROLE, DEFAULT_MEMBER_COLOR

class RoleRepository(BaseRepository[Role]):
    model = Role

    def get_or_create_default_owner_role(self, club: Club, permissions: QuerySet[ClubPermission, ClubPermission]) -> Role:

        role, created = self.get_queryset().get_or_create(
            club=club,
            name=Role.DEFAULT_ROLE,
            color=Role.DEFAULT_COLOR,
        )

        if created:
            role.permissions.set(permissions)

        return role

    def get_or_create_default_member_role(self, club: Club) -> Role:

        role, _ = self.get_queryset().get_or_create(
            club=club,
            name=DEFAULT_MEMBER_ROLE,
            defaults={
                "permissions": {},
                "is_default": True,
                "color": DEFAULT_MEMBER_COLOR,
            },
        )

        return role

    def list_roles(self, club_pk: str) -> QuerySet[Role]:
        return self.model.objects.filter(club__id=club_pk)