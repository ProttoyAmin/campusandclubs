# serializers.py
from rest_framework import serializers as rest_serializers
from django.urls import reverse
from django.utils.text import slugify
from django.db.models import Value
from django.db.models.functions import Lower, Replace
from django.conf import settings
from . import models
from apps.institutes.models import Institute
import mimetypes

MAX_SIZE = 5 * 1024 * 1024


class RoleSerializer(rest_serializers.ModelSerializer):
    id = rest_serializers.CharField(read_only=True)
    user_count = rest_serializers.SerializerMethodField()

    class Meta:
        model = models.Role
        fields = [
            'id', 'name', 'permissions', 'is_default',
            'color', 'user_count'
        ]
        read_only_fields = ['id']

    def get_user_count(self, obj):
        """Get count of users with this role"""
        return obj.user_count() if hasattr(obj, 'user_count') else 0







class DemoSerializer(rest_serializers.ModelSerializer):
    class Meta:
        model = models.Club
        fields = "__all__"



class ClubBannerUploadSerializer(rest_serializers.Serializer):
    banner = rest_serializers.FileField(
        required=True,
        allow_empty_file=False,
        max_length=None,
        help_text="Upload banner image or video for the club"
    )

    def validate_banner(self, value):
        max_size = MAX_SIZE * 2  # Allow larger size for banners/videos

        if value.size > max_size:
            raise rest_serializers.ValidationError(
                f"File size too large. Maximum size is {max_size//1024//1024}MB"
            )

        valid_mime_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime'
        ]
        mime_type, _ = mimetypes.guess_type(value.name)

        if mime_type not in valid_mime_types:
            ext = value.name.split('.')[-1].lower()
            allowed_exts = ['jpg', 'jpeg', 'png',
                            'gif', 'webp', 'mp4', 'webm', 'mov']
            if ext not in allowed_exts:
                raise rest_serializers.ValidationError(
                    f"Unsupported file type. Supported types: {', '.join(valid_mime_types)}"
                )

        return value


class EventSerializer(rest_serializers.ModelSerializer):
    id = rest_serializers.CharField(read_only=True)
    creator_username = rest_serializers.CharField(
        source='creator.username', read_only=True)
    creator_id = rest_serializers.IntegerField(
        source='creator.id', read_only=True)
    creator_profile_picture = rest_serializers.SerializerMethodField()
    club_id = rest_serializers.CharField(read_only=True)
    club_name = rest_serializers.CharField(source='club.name', read_only=True)
    club_origin = rest_serializers.CharField(
        source='club.origin', read_only=True)
    participant_count = rest_serializers.IntegerField(read_only=True)
    is_full = rest_serializers.BooleanField(read_only=True)
    is_participant = rest_serializers.SerializerMethodField()
    can_edit = rest_serializers.SerializerMethodField()

    class Meta:
        model = models.Event
        fields = [
            'id', 'club_id', 'club_name', 'club_origin',
            'creator_id', 'creator_username', 'creator_profile_picture',
            'title', 'description', 'location', 'start_time', 'end_time',
            'status', 'max_participants', 'participant_count', 'is_full',
            'is_participant', 'can_edit', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'participant_count',
                            'is_full', 'created_at', 'updated_at']

    def get_creator_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.creator.profile_picture:
            return request.build_absolute_uri(obj.creator.profile_picture.url)
        return None

    def get_is_participant(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        if hasattr(obj, 'user_is_participant'):
            return obj.user_is_participant
        return obj.participants.filter(id=request.user.id).exists()

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        if obj.creator == request.user:
            return True
        membership = models.Membership.objects.filter(
            user=request.user, club=obj.club
        ).prefetch_related('roles').first()
        if membership:
            # Check any role for the permission
            for role in membership.roles.all():
                if role.has_permission('can_manage_events'):
                    return True
        return False


# ============= NEW SERIALIZERS =============

class RoleCreateUpdateSerializer(rest_serializers.ModelSerializer):
    """Serializer for creating/updating roles"""
    class Meta:
        model = models.Role
        fields = [
            'name', 'permissions', 'color', 'is_default'
        ]

    def validate_name(self, value):
        """Ensure role name is unique within club"""
        club = self.context.get('club')
        if club and value:

            if not value or value.strip() == '':
                raise rest_serializers.ValidationError(
                    "Role name cannot be empty")
            if len(value.strip()) < 2:
                raise rest_serializers.ValidationError(
                    "Role name must be at least 2 characters long")
            if len(value.strip()) > 50:
                raise rest_serializers.ValidationError(
                    "Role name cannot exceed 50 characters")

            # Check case-insensitive uniqueness
            existing = models.Role.objects.filter(
                club=club,
                name__iexact=value
            ).exclude(id=getattr(self.instance, 'id', None))

            if existing.exists():
                raise rest_serializers.ValidationError(
                    f'A role with name "{value}" already exists in this club.'
                )
        return value


class ClubMemberUpdateSerializer(rest_serializers.Serializer):
    """Serializer for updating club members"""
    role_id = rest_serializers.IntegerField(required=False)
    role_name = rest_serializers.CharField(required=False)

    def validate(self, attrs):
        role_id = attrs.get('role_id')
        role_name = attrs.get('role_name')

        if not role_id and not role_name:
            raise rest_serializers.ValidationError(
                "Either role_id or role_name must be provided"
            )

        if role_id and role_name:
            raise rest_serializers.ValidationError(
                "Provide either role_id or role_name, not both"
            )

        return attrs
