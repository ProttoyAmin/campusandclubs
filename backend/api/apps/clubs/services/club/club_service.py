
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

from apps.clubs.models import Membership, ApplicationStatus
from apps.clubs.repositories.form import FormRepository
from core.services import BaseService
from apps.clubs.models import Club, Visibility, MembershipApplication, JoinMode
from apps.clubs.repositories.club.club_repo import ClubRepository
from apps.clubs.dtos import ClubListFilters
from apps.clubs.repositories.role.role_repo import RoleRepository
from apps.clubs.repositories import MembershipRepository, MembershipApplicationRepository

from apps.accounts.models import User

logger = logging.getLogger(__name__)

class ClubService(PolicyMixin[ClubPolicy, Membership], BaseService[Club, ClubRepository]):
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

    def create_club(self, owner: User, **validated_data: ClubCreateDTO) -> Club:
        from apps.clubs.models import ClubDepartment
        from apps.media.models import Media, MediaRole
        from django.contrib.contenttypes.models import ContentType

        logger.info(f"Creating club with data: {validated_data}")
        avatar = validated_data.pop("avatar")
        banner = validated_data.pop("banner")

        with transaction.atomic():

            department_templates = validated_data.pop("department_templates", [])
            logger.info(f"Department templates: {department_templates}")

            club = self.repository.create(
                owner=owner,
                **validated_data
            )
            
            for department_template in department_templates:
                ClubDepartment.objects.create(
                    club=club,
                    name=department_template.name,
                )

            club_content_type = ContentType.objects.get_for_model(club)

            if avatar:
                Media.objects.create(
                    content_type=club_content_type,
                    object_id=club.id,
                    file=avatar,
                    role=MediaRole.AVATAR
                )

            if banner:
                Media.objects.create(
                    content_type=club_content_type,
                    object_id=club.id,
                    file=banner,
                    role=MediaRole.BANNER
                )
            
            role = self.role_repository.get_or_create_default_owner_role(club)
            membership = self.membership_repository.create(user=owner, club=club)
            self.membership_repository.add_role(membership, role, set_as_primary=True)
        
        return club

    def get_club_detail(self, club_pk, viewer: User) -> Club:
        return self.repository.with_list_annotations(self.repository.get_queryset().filter(pk=club_pk), viewer).get()

    def join_club(self, club: Club, user: User) -> Membership:
        return self.membership_repository.create_membership(club, user)

    def leave_club(self, club: Club, actor: User):
        decision = self.get_policy(actor, club).can_leave()

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
        from apps.clubs.models import Post, Event

        member_count = club.members.count()
        post_count = club.club_posts.count()
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

    def upload_media(self, club: Club, file, kind: str) -> Club:
        """Persist the uploaded media file and update the club's avatar/banner.

        `kind` is either "avatar" or "banner". Returns the updated club.
        """
        import os
        import time
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        upload_path_prefix = "images/club-pictures"
        ext = os.path.splitext(file.name)[1]
        filename = f"club_{club.id}_{kind}_{int(time.time())}{ext}"
        file_path = os.path.join(upload_path_prefix, filename)

        saved_path = default_storage.save(file_path, ContentFile(file.read()))

        from django.conf import settings
        file_url = os.path.join(settings.MEDIA_URL, saved_path).replace("\\", "/")

        if kind == "avatar":
            club.avatar = file_url
        else:
            club.banner = file_url
        club.save()
        return club

    def clear_media(self, club: Club, kind: str) -> Club:
        """Clear the club's avatar or banner (no file deletion; just DB column)."""
        if kind == "avatar":
            club.avatar = None
        else:
            club.banner = None
        club.save()
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
