from apps.clubs.models.membership.membership import Membership


from django.db.models import QuerySet, Prefetch, Count
from core.repositories import BaseRepository
from apps.clubs.models import (
    Membership,
    Club,
    Role,
)
from apps.accounts.models import User

class MembershipRepository(BaseRepository[Membership]):
    """Membership repository class for managing membership operations"""
    model = Membership

    def get_queryset(self) -> QuerySet[Membership]:
        return super().get_queryset()

    def add_role(self, membership: Membership, role: Role, set_as_primary: bool = False) -> Membership:
        membership.roles.add(role)
        if set_as_primary or not membership.primary_role:
            membership.primary_role = role
            membership.save(update_fields=["primary_role"])
        return membership

    def create_membership(
        self,
        club: Club,
        user: User
    ) -> Membership:
        self.create(
            club=club,
            user=user,
        )
        return self.get_queryset().get(club=club, user=user)
    
    

