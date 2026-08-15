from typing import Any, Mapping, TypedDict
from django.urls import reverse
from rest_framework import serializers
from rest_framework.request import Request


from apps.clubs.models import Club, Membership, Role
from apps.accounts.models import User
from apps.clubs.serializer.membership.m_serializers import MembershipApplicationSerializer


class OwnerDetails(TypedDict):
    id: int
    username: str
    profile_picture: str | None


class UserRoleDetails(TypedDict):
    id: int
    name: str
    permissions: list[str]


class ClubDetailSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    origin = serializers.CharField(required=False, allow_blank=True, allow_null=True,
                                   default=None)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    owner_details = serializers.SerializerMethodField()
    total_members = serializers.SerializerMethodField()
    # post_count = serializers.SerializerMethodField()
    # event_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()

    is_public = serializers.SerializerMethodField()
    application = serializers.SerializerMethodField()

    url = serializers.SerializerMethodField()
    members_url = serializers.SerializerMethodField()
    posts_url = serializers.SerializerMethodField()
    events_url = serializers.SerializerMethodField()
    leave_url = serializers.SerializerMethodField()
    join_url = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'origin', 'slug', 'about', 'avatar', 'banner', 'media', 'privacy',
            'is_public', 'allow_public_posts', 'rules', 'owner', 'owner_details',
            'total_members', 'join_mode', 'status', 'scope', 'category', 'application',
            'user_role', 'is_member', 'is_owner',
            'url', 'members_url', 'posts_url', 'events_url', 'leave_url', 'join_url',
            'created_at', 'updated_at'
        ]

    def _get_request(self) -> Request | None:
        return self.context.get('request')

    def get_owner_details(self, obj: Club) -> OwnerDetails:
        owner: User = obj.owner
        profile_picture_url: str | None = owner.avatar if owner.avatar else None
        return {
            'id': owner.id,
            'username': owner.username,
            'profile_picture': profile_picture_url,
        }

    def get_is_owner(self, obj: Club) -> bool:
        request = self._get_request()
        if not (request and request.user.is_authenticated):
            return False
        return obj.owner == request.user

    def get_avatar(self, obj: Club):
        from apps.media.models import MediaRole
        return obj.media.filter(role=MediaRole.AVATAR).first().file.url if obj.media.filter(role=MediaRole.AVATAR).exists() else None

    def get_banner(self, obj: Club):
        from apps.media.models import MediaRole
        return obj.media.filter(role=MediaRole.BANNER).first().file.url if obj.media.filter(role=MediaRole.BANNER).exists() else None

    def get_media(self, obj: Club):
        from apps.media.serializers import MediaListSerializer
        media = obj.media.all()
        return MediaListSerializer(media, many=True, context=self.context).data

    def get_is_public(self, obj: Club) -> bool:
        return obj.privacy == 'public'

    def get_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:club_info', kwargs={'pk': obj.pk}))

    def get_members_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:list_members', kwargs={'pk': obj.pk}))

    def get_posts_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:list_posts', kwargs={'pk': obj.pk}))

    def get_events_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:list_events', kwargs={'pk': obj.pk}))

    def get_leave_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:leave_club', kwargs={'pk': obj.pk}))

    def get_join_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:join_club', kwargs={'pk': obj.pk}))

    def get_total_members(self, obj: Club) -> int:
        return getattr(obj, 'total_members', obj.members.count())

    # def get_post_count(self, obj: Club) -> int:
    #     return getattr(obj, 'post_count', obj.total_posts)

    # def get_event_count(self, obj: Club) -> int:
    #     return getattr(obj, 'event_count', obj.total_events)

    def get_user_role(self, obj: Club) -> UserRoleDetails | None:
        request = self._get_request()
        if not (request and request.user.is_authenticated):
            return None

        memberships: list[Membership]
        if hasattr(obj, 'user_memberships'):
            memberships = obj.user_memberships  # type: ignore[attr-defined]
        else:
            memberships = list[Membership](
                Membership.objects.filter(
                    user=request.user, club=obj
                ).prefetch_related('roles')
            )

        membership = memberships[0] if memberships else None
        if membership and membership.roles.exists():
            role: Role = membership.roles.first()  # type: ignore[assignment]
            return {
                'id': role.id,
                'name': role.name,
                'permissions': list[str](role.get_all_permissions()),
            }
        return None

    def get_is_member(self, obj: Club) -> bool:
        request = self._get_request()
        if hasattr(obj, 'user_memberships'):
            return bool(obj.user_memberships)  # type: ignore[attr-defined]
        return Membership.objects.filter(
            user=request.user, club=obj, left_at__isnull=True
        ).exists()

    def get_application(self, obj: Club):
        from core.policies.utils import current_user
        from apps.clubs.repositories import MembershipApplicationRepository
        request = self._get_request()

        if not (request and request.user.is_authenticated):
            return None

        application = MembershipApplicationRepository().get_membership_application_for_user(
            club=obj, applicant=current_user(request)
        )

        if application is None:
            return {
                'status': None
            }
        return MembershipApplicationSerializer(application).data
