from django.db.models import (
    Count,
    Prefetch,
    Q,
    QuerySet
)

from core.repositories import BaseRepository
from apps.clubs.models import Club, Membership, Visibility
from apps.clubs.repositories.role.role_repo import RoleRepository

class ClubRepository(BaseRepository[Club]):
    model = Club
    role_repository = RoleRepository
    
    def get_queryset(self) -> QuerySet[Club]:
        return super().get_queryset().filter(deleted_at__isnull=True)

    def visible_to(self, user) -> QuerySet[Club]:
        """Public clubs, plus any club the user is a member of."""
        return self.get_queryset().filter(Q(privacy=Visibility.PUBLIC) | Q(members=user) | Q(privacy=Visibility.PRIVATE))

    def joined_by(self, user) -> QuerySet[Club]:
        return self.get_queryset().filter(members=user)

    def search(self, queryset: QuerySet[Club], term: str) -> QuerySet[Club]:
        return queryset.filter(
            Q(name__icontains=term)
            | Q(origin__name__icontains=term)
            | Q(origin__country__icontains=term)
            | Q(origin__code__iexact=term)
        )

    def with_list_annotations(self, queryset: QuerySet[Club], viewer) -> QuerySet[Club]:
        return (
            queryset.distinct()
            .annotate(
                member_count=Count("members", distinct=True),
                event_count=Count("events", distinct=True),
            )
            .prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=Membership.objects.filter(user=viewer).prefetch_related("roles"),
                    to_attr="user_memberships",
                )
            )
            .select_related("owner")
            .order_by("-created_at")
        )