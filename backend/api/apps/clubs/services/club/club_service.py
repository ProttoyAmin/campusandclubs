from apps.clubs.policies.club import ClubPolicy
from apps.clubs.dtos.club_create import ClubCreateDTO
from core.views import PolicyMixin
import logging
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser
from typing import Optional
from django.db import transaction
from django.db.models import QuerySet
from django.views.generic.dates import timezone_today
from rest_framework.exceptions import ValidationError

from apps.clubs.models import Membership, ApplicationStatus, Role
from apps.clubs.repositories.form import FormRepository
from core.services import BaseService
from apps.clubs.models import Club, Visibility, MembershipApplication, JoinMode
from apps.clubs.repositories.club.club_repo import ClubRepository
from apps.clubs.dtos import ClubListFilters
from apps.clubs.repositories.role.role_repo import RoleRepository
from apps.clubs.repositories import MembershipRepository, MembershipApplicationRepository

from apps.accounts.models import User
from django.core.files.uploadedfile import UploadedFile


logger = logging.getLogger(__name__)

class ClubService(PolicyMixin[ClubPolicy, Club], BaseService[Club, ClubRepository]):
    """Club service class for managing club operations"""

    repository_class = ClubRepository
    policy_class = ClubPolicy

    def __init__(
        self,
        actor: Optional[AbstractBaseUser] = None,
        repository: Optional[ClubRepository] = None,
    ) -> None:
        super().__init__(actor, repository)
        self.role_repository = RoleRepository()
        self.membership_repository = MembershipRepository()
        self.membership_application_repository = MembershipApplicationRepository()
        self.form_repository = FormRepository()

    def _get_object(self, pk: int) -> Club:
        return self.repository.get_queryset().filter(pk=pk).get()



    def list_clubs(self, viewer: User | AnonymousUser, filters: ClubListFilters) -> QuerySet[Club]:
        clubs = (
            self.repository.joined_by(viewer)
            if filters.joined
            else self.repository.visible_to(viewer)
        )

        if filters.search:
            clubs = self.repository.search(clubs, filters.search)

        if filters.privacy in Visibility.values:
            clubs = clubs.filter(privacy=filters.privacy)

        if filters.origin:
            clubs = clubs.filter(origin=filters.origin)

        return self.repository.with_list_annotations(clubs, viewer)

    def create_club(self, owner: User, dto: ClubCreateDTO) -> Club:
        from apps.clubs.models import ClubDepartment, ClubPreference

        logger.info(f"Creating club with data: {dto}")

        with transaction.atomic():

            department_templates = dto.departments
            logger.info(f"Department templates: {department_templates}")

            club = self.repository.create(
                owner=owner,
                name=dto.name,
                about=dto.about,
                privacy=dto.privacy,
                scope=dto.scope,
                join_mode=dto.join_mode,
                origin=dto.origin,
            )
            
            for department_template in department_templates:
                ClubDepartment.objects.create(
                    club=club,
                    name=department_template.name,
                )

            self.upload_media(club, dto.avatar, "avatar")
            self.upload_media(club, dto.banner, "banner")

            ClubPreference.objects.create(
                club=club
            )
            
            role = self.role_repository.get_or_create_default_owner_role(club)
            membership = self.membership_repository.create(user=owner, club=club)
            self.membership_repository.add_role(membership, role, set_as_primary=True)
        
        return club

    def get_club_detail(self, club_pk, viewer: User) -> Club:
        return self.repository.with_list_annotations(self.repository.get_queryset().filter(pk=club_pk), viewer).get()

    def join_club(self, club: Club, user: User) -> Membership:

        existing = self.membership_repository.filter(club=club, user=user).first()

        if existing:
            if existing.left_at is None:
                raise ValidationError({"detail": "You are already an active member of this club."})
            return self.rejoin(existing)

        return self.membership_repository.create_membership(club, user)

    @staticmethod
    def rejoin(membership: Membership) -> Membership:
        with transaction.atomic():
            membership.left_at = None
            # TODO: Re-add default role to membership

            # membership.roles.
            # membership.primary_role = default_role
            membership.full_clean()
            membership.save(update_fields=["left_at"])
        return membership

    def leave_club(self, club: Club, actor: User):
        from apps.clubs.models import ClubPreference

        decision = self.get_policy(actor, club).can_leave()

        preferences = ClubPreference.objects.filter(club=club).first()

        if preferences and preferences.leave_application:
            ...    # TODO: Implement leave application

        if decision.allowed:
            membership = self.membership_repository.get_queryset().get(
                club=club, user=actor, left_at__isnull=True
            )
            return self.membership_repository.leave(membership)
        
        raise ValidationError({"detail" : decision.reason})

    def apply_to_club(self, club: Club, user: User, message: str) -> MembershipApplication:

        if self.membership_application_repository.application_exists(club, user):
            raise ValidationError({"detail": "You already have a pending application for this club."})

        return self.membership_application_repository.create_membership_application(club, user, message)

    def get_membership_applications(self, club: Club) -> QuerySet[MembershipApplication]:
        return self.membership_application_repository.get_membership_applications(club)

    def approve_application(self, application: MembershipApplication, reviewer: User) -> MembershipApplication:
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError({"detail": "Only a pending application can be approved."})

        application.status = ApplicationStatus.APPROVED
        application.reviewed_by = reviewer
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "reviewed_by", "reviewed_at"])

        default_role = application.club.roles.filter(is_default=True).first()
        membership = Membership.objects.create(user=application.applicant, club=application.club, application=application)
        if default_role:
            membership.add_role(default_role, set_as_primary=True)

        return application

    def reject_application(self, application: MembershipApplication, reviewer: User) -> MembershipApplication:
        if application.status != ApplicationStatus.PENDING:
            raise ValidationError({"detail": "Only a pending application can be rejected."})

        application.status = ApplicationStatus.REJECTED
        application.reviewed_by = reviewer
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "reviewed_by", "reviewed_at"])
        return application

    def withdraw_application(self, application: MembershipApplication) -> MembershipApplication:
        application.status = ApplicationStatus.WITHDRAWN
        application.save(update_fields=["status"])
        return application

    # ---------- Discovery / Stats ----------

    def recommend_for_user(self, user: User) -> QuerySet[Club]:
        """Delegate to repository so the recommendation algorithm lives
        next to the persistence layer that owns the underlying queries."""
        return self.repository.recommend_for_user(user)

    def trending_clubs(self) -> QuerySet[Club]:
        from django.utils import timezone
        from datetime import timedelta

        week_ago = timezone.now() - timedelta(days=7)
        return self.repository.trending(week_ago=week_ago)

    def search_clubs(self, query: str) -> QuerySet[Club]:
        return self.repository.search_public(query)

    def clubs_by_origin(self, origin: str) -> QuerySet[Club]:
        return self.repository.by_origin(origin)

    def get_club_stats(self, club: Club, *, since) -> dict:
        from apps.clubs.models import Event
        from apps.posts.models import Post

        member_count = club.members.count()
        post_count = club.posts.count()
        event_count = club.events.count()

        roles_data = [
            {
                "role_id": str(role.id),
                "role_name": role.name,
                "user_count": role.user_count() if hasattr(role, "user_count") else 0,
                "color": role.color,
                "is_default": role.is_default,
            }
            for role in club.roles.all()
        ]

        recent_posts = Post.objects.filter(club=club, created_at__gte=since).count()
        recent_events = Event.objects.filter(club=club, created_at__gte=since).count()
        new_members = Membership.objects.filter(club=club, joined_at__gte=since).count()

        engagement_rate = 0
        if member_count > 0:
            engagement_rate = min(100, (recent_posts + recent_events) / member_count * 100)

        return {
            "member_count": member_count,
            "post_count": post_count,
            "event_count": event_count,
            "roles_data": roles_data,
            "recent_posts": recent_posts,
            "recent_events": recent_events,
            "new_members": new_members,
            "engagement_rate": round(engagement_rate, 2),
        }

    # ---------- Media ----------

    def upload_media(self, club: Club, file: UploadedFile | None, kind: str) -> Club:
        from apps.media.models import Media, MediaRole
        from django.contrib.contenttypes.models import ContentType

        if file is None:
            return club

        role_map = {"avatar": MediaRole.AVATAR, "banner": MediaRole.BANNER}
        role = role_map.get(kind, MediaRole.OTHER)

        Media.objects.create(
            content_type=ContentType.objects.get_for_model(club),
            object_id=club.id,
            file=file,
            role=role,
        )
        return club

    def clear_media(self, club: Club, kind: str) -> Club:
        """Remove the club's avatar or banner Media record (row only, no storage/Cloudinary deletion)."""
        from apps.media.models import Media, MediaRole
        from django.contrib.contenttypes.models import ContentType

        role_map = {"avatar": MediaRole.AVATAR, "banner": MediaRole.BANNER}
        role = role_map.get(kind)
        if role is None:
            return club

        Media.objects.filter(
            content_type=ContentType.objects.get_for_model(club),
            object_id=club.id,
            role=role,
        ).delete()

        return club

    # ---------- Membership ----------

    def list_members(
        self,
        club: Club,
        *,
        role_name: str | None = None,
        search: str | None = None,
        sort_by: str = "joined_at",
        order: str = "desc",
    ) -> QuerySet[Membership]:
        return self.membership_repository.list_for_club(
            club,
            role_name=role_name,
            search=search,
            sort_by=sort_by,
            order=order,
        )
