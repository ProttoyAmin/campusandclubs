from django.utils import timezone
from django.db.models import (
    Count,
    Prefetch,
    Q,
    QuerySet
)

from core.repositories import BaseRepository
from apps.clubs.models import Club, Membership, Visibility, ClubStatus
from apps.clubs.repositories.role.role_repo import RoleRepository
from apps.clubs.dtos.club_create import ClubDuplicateCheckDTO


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
                post_count=Count("posts", distinct=True),
            )
            .prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=Membership.objects.filter(user=viewer, left_at__isnull=True).prefetch_related("roles"),
                    to_attr="user_memberships",
                )
            )
            .select_related("owner")
            .order_by("-created_at")
        )

    def get_with_annotations_for_viewer(self, pk, viewer) -> Club:
        """Single Club with member/event/post counts and viewer's active memberships prefetched.
        Used by `club_info` for GET / PATCH / DELETE.
        """
        return (
            self.get_queryset()
            .filter(status=ClubStatus.ACTIVE)
            .annotate(
                member_count=Count("members", distinct=True),
                event_count=Count("events", distinct=True),
            )
            .prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=Membership.objects.filter(
                        user=viewer, left_at__isnull=True
                    ).prefetch_related("roles"),
                    to_attr="user_memberships",
                )
            )
            .select_related("owner")
            .get(pk=pk)
        )

    def visible_qs_for_viewer(self, viewer, *, only_member: bool = False) -> QuerySet[Club]:
        """Scope `club_info`'s base queryset:
        - `only_member=True` → only clubs the viewer is a member of (used for PATCH/DELETE).
        - `only_member=False` → public OR member-clubs (used for GET).
        """
        base = self.get_queryset().filter(status=ClubStatus.ACTIVE)
        if only_member:
            return base.filter(members=viewer)
        return base.filter(Q(privacy=Visibility.PUBLIC) | Q(members=viewer))

    def soft_delete(self, club: Club) -> Club:
        """Soft-delete: stamp `deleted_at` and persist. Repository-level because
        it's purely a persistence concern; authorization lives in the policy."""
        club.deleted_at = timezone.now()
        club.save()
        return club

    def recommend_for_user(self, user) -> QuerySet[Club]:
        """Personalized recommendation queryset. Excludes secret clubs, clubs
        the user is already a member of, and biases toward clubs matching the
        user's origin (first via memberships, then via user profile.origin)."""
        user_club_ids = Membership.objects.filter(
            user=user
        ).values_list("club_id", flat=True)

        clubs = (
            self.get_queryset()
            .filter(status=ClubStatus.ACTIVE)
            .exclude(privacy=Visibility.SECRET)
            .exclude(id__in=user_club_ids)
        )

        user_origins = Membership.objects.filter(
            user=user
        ).values_list("club__origin", flat=True).distinct()

        if user_origins:
            same_origin = clubs.filter(origin__in=user_origins)
            if same_origin.exists():
                clubs = same_origin

        if hasattr(user, "profile") and getattr(user.profile, "origin", None):
            profile_origin = clubs.filter(origin__iexact=user.profile.origin)
            if profile_origin.exists():
                profile_origin = profile_origin.exclude(
                    id__in=clubs.values_list("id", flat=True)
                )
                clubs = clubs | profile_origin

        if not clubs.exists():
            clubs = clubs.filter(privacy=Visibility.PUBLIC)

        return clubs.prefetch_related(
            Prefetch(
                "memberships",
                queryset=Membership.objects.filter(
                    user=user, left_at__isnull=True
                ).prefetch_related("roles"),
                to_attr="user_memberships",
            )
        )

    def trending(self, *, week_ago, limit: int = 10) -> QuerySet[Club]:
        """Trending clubs: ranked by posts/events from the last 7 days plus member count."""
        return (
            self.get_queryset()
            .filter(status=ClubStatus.ACTIVE)
            .exclude(privacy=Visibility.SECRET)
            .annotate(
                member_count=Count("members", distinct=True),
                recent_posts=Count(
                    "club_posts",
                    filter=Q(club_posts__created_at__gte=week_ago),
                ),
                recent_events=Count(
                    "events",
                    filter=Q(events__created_at__gte=week_ago),
                ),
                trending_score=(
                    Count("club_posts", filter=Q(club_posts__created_at__gte=week_ago)) * 2
                    + Count("events", filter=Q(events__created_at__gte=week_ago)) * 3
                    + Count("members", distinct=True) * 0.5
                ),
            )
            .order_by("-trending_score", "-member_count")[:limit]
        )

    def search_public(self, query: str) -> QuerySet[Club]:
        """Full-text search over name, origin, about, slug for public clubs."""
        return (
            self.get_queryset()
            .filter(status=ClubStatus.ACTIVE, privacy=Visibility.PUBLIC)
            .filter(
                Q(name__icontains=query)
                | Q(origin__icontains=query)
                | Q(about__icontains=query)
                | Q(slug__icontains=query)
            )
            .distinct()
            .annotate(
                member_count=Count("members", distinct=True),
                post_count=Count("club_posts", distinct=True),
            )
            .order_by("-member_count", "-created_at")
        )

    def by_origin(self, origin: str) -> QuerySet[Club]:
        """Public clubs filtered by origin."""
        return (
            self.get_queryset()
            .filter(status=ClubStatus.ACTIVE, privacy=Visibility.PUBLIC, origin__iexact=origin)
            .annotate(
                member_count=Count("members", distinct=True),
                post_count=Count("club_posts", distinct=True),
            )
            .order_by("-member_count", "-created_at")
        )

    def exists_similar_name(self, data: ClubDuplicateCheckDTO) -> bool:
        from django.db.models import Value
        from django.db.models.functions import Lower, Replace

        normalized_name = data.name.strip().replace(" ", "").lower()

        queryset = self.get_queryset().annotate(
            normalized_name_db=Lower(Replace("name", Value(" "), Value("")))
        ).filter(
            normalized_name_db=normalized_name,
            origin=data.origin,
        )

        if data.exclude_pk:
            queryset = queryset.exclude(pk=data.exclude_pk)

        return queryset.exists()