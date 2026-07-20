from core.repositories import BaseRepository
from apps.clubs.models import Role, Club
from apps.clubs.views import DEFAULT_COLOR, DEFAULT_ROLE


class RoleRepository(BaseRepository[Role]):
    model = Role

    def get_or_create_default_owner_role(self, club: Club) -> Role:

        role, _ = self.get_queryset().get_or_create(
            club=club,
            name=DEFAULT_ROLE,
            defaults={
                "permissions": {
                    "can_manage_members": True,
                    "can_manage_posts": True,
                    "can_manage_events": True,
                    "can_manage_settings": True,
                },
                "is_default": True,
                "color": DEFAULT_COLOR,
            },
        )

        return role
