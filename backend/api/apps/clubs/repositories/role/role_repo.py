from core.repositories import BaseRepository
from apps.clubs.models import Role, Club
from core.constants import DEFAULT_COLOR, DEFAULT_ROLE


class RoleRepository(BaseRepository[Role]):
    model = Role

    def get_or_create_default_owner_role(self, club: Club) -> Role:

        role, _ = self.get_queryset().get_or_create(
            club=club,
            name=DEFAULT_ROLE,
            defaults={
                "permissions": {
                    "manage:members": True,
                    "manage:posts": True,
                    "manage:events": True,
                    "manage:settings": True,
                },
                "is_default": True,
                "color": DEFAULT_COLOR,
            },
        )

        return role
