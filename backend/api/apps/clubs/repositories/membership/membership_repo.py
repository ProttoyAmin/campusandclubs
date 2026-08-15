from django.utils import timezone
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
    
    def exists(self, club: Club, user: User):
        return self.filter(club=club, user=user, left_at__isnull=True).exists()
    
    def leave(self, membership: Membership) -> None:
        membership.roles.clear()
        self.update(membership, primary_role=None, left_at=timezone.now())

    def list_for_club(
        self,
        club: Club,
        *,
        exclude_owner: bool = True,
        role_name: str | None = None,
        search: str | None = None,
        sort_by: str = "joined_at",
        order: str = "desc",
    ) -> QuerySet[Membership]:
        """List memberships for a club with filtering and sorting."""
        from django.db.models import F, Q

        qs = self.get_queryset().filter(club=club).select_related("user").prefetch_related("roles")

        if exclude_owner:
            qs = qs.exclude(user_id=F("club__owner_id"))

        if role_name:
            qs = qs.filter(roles__name__iexact=role_name)

        if search:
            qs = qs.filter(
                Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )

        sort_map = {"username": "user__username", "role": "role__name"}
        sort_field = sort_map.get(sort_by, "joined_at")
        if order != "asc":
            sort_field = f"-{sort_field}"
        return qs.order_by(sort_field)



