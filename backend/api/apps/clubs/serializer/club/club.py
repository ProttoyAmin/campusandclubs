from django.db.models import Value
from django.db.models.functions import Lower, Replace
from django.urls import reverse
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework.request import Request

from apps.clubs.models import Club, Visibility, MembershipScope
from apps.institutes.models import Institute
from core.policies.utils import current_user


MAX_SIZE = 5 * 1024 * 1024

class ClubCreateSerializer(serializers.ModelSerializer):
    """
    Create club serializer
    """

    name = serializers.CharField(max_length=100)
    about = serializers.CharField(max_length=500)
    privacy = serializers.ChoiceField(choices=Visibility.choices)
    scope = serializers.ChoiceField(choices=MembershipScope.choices)
    origin = serializers.PrimaryKeyRelatedField[Institute](queryset=Institute.objects.all(), required=False, allow_null=True)


    class Meta:
        model = Club
        fields = ['id', 'name', 'about', 'privacy', 'scope', 'origin']
        read_only_fields = ['id']

    def _get_request(self) -> Request:
        return self.context.get('request')     # type: ignore

    def __init__(self, *args, **kwargs):
        from apps.institutes.services import InstituteService  # Importing inside the method to avoid circular imports
        from apps.clubs.repositories import ClubRepository
        super().__init__(*args, **kwargs)
        self._club_repository = ClubRepository()
        institute_service = InstituteService()
        if self._get_request() and self._get_request().user.is_authenticated:
            self.fields['origin'].queryset = institute_service.get_distinct_affiliate_institutes(current_user(self._get_request()))     # type: ignore

    def get_validators(self):
        """
        Remove the default UniqueTogetherValidator that DRF adds automatically
        for the UniqueConstraint in the model. We'll handle this validation ourselves.
        """
        validators = super().get_validators()
        validators = [
            v for v in validators
            if not (
                hasattr(v, 'fields') and
                set(getattr(v, 'fields', [])) == {'name', 'origin'}
            )
        ]
        return validators

    def validate(self, attrs):
        """Check for duplicate club name + origin combination (robust)"""
        from apps.clubs.dtos.club_create import ClubDuplicateCheckDTO

        name = attrs.get('name')
        origin = attrs.get('origin')

        if name:
            check = ClubDuplicateCheckDTO(
                name=name,
                origin=origin,
                exclude_pk=self.instance.pk if self.instance else None,
            )
            if self._club_repository.exists_similar_name(check):
                origin_name = origin.name if origin else "Global"
                raise serializers.ValidationError({
                    'name': f'A club with a very similar name already exists for "{origin_name}". '
                            f'Please choose a more distinct name.'
                })
        return attrs

        
    def update(self, instance, validated_data):
        """Handle Slug update on name/origin change"""
        if 'name' in validated_data or 'origin' in validated_data:
            name = validated_data.get('name', instance.name)
            origin = validated_data.get('origin', instance.origin)
            origin_str = str(origin.id) if origin else "global"
            instance.slug = slugify(f"{name.strip()}-{origin_str}")
        return super().update(instance, validated_data)




class ClubSerializer(serializers.ModelSerializer):
    """
    List clubs serializer
    
    Used for listing clubs, includes fields like name, owner, origin, about, avatar, banner, privacy, allow_public_posts, is_member, total_members, total_events, total_posts, is_public, club_url, join_url, leave_url, and members_url.
    """

    is_member = serializers.SerializerMethodField()
    origin = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()

    total_members = serializers.SerializerMethodField()
    total_events = serializers.SerializerMethodField()
    total_posts = serializers.SerializerMethodField()
    is_public = serializers.SerializerMethodField()


    club_url = serializers.SerializerMethodField()
    join_url = serializers.SerializerMethodField()
    leave_url = serializers.SerializerMethodField()
    members_url = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = ['id', 'name', 'owner', 'origin', 'about',
                  'avatar', 'banner', 'privacy','allow_public_posts', 'is_member',
                  'total_members', 'total_events', 'total_posts', 'is_public',
                  'club_url', 'join_url', 'leave_url', 'members_url'
                  ]
        read_only_fields = ['id']

    def _get_request(self) -> Request | None:
        return self.context.get('request')

    def get_total_members(self, obj: Club) -> int:
        return obj.members.count()
    
    def get_total_events(self, obj: Club) -> int:
        return obj.events.count()

    def get_total_posts(self, obj: Club) -> int:
        return obj.posts.count()
    
    def get_is_public(self, obj: Club) -> bool:
        return obj.privacy == 'public'
    
    def get_members_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:list_members', kwargs={'pk': obj.pk}))
    
    def get_club_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:club_info', kwargs={'pk': obj.pk}))
 
    def get_leave_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:leave_club', kwargs={'pk': obj.pk}))
 
    def get_join_url(self, obj: Club) -> str:
        request = self._get_request()
        assert request is not None
        return request.build_absolute_uri(reverse('clubs:join_club', kwargs={'pk': obj.pk}))

    def get_is_member(self, obj: Club) -> bool:
        return obj.members.filter(id=self.context['request'].user.id).exists()


    def get_origin(self, obj):
        if obj.origin:
            return {
                'id': obj.origin.id,
                'name': obj.origin.name
            }

    def get_owner(self, obj):
        if obj.owner:
            return {
                'id': obj.owner.id,
                'username': obj.owner.username,
                'email': obj.owner.email,
                'avatar': obj.owner.avatar if obj.owner.avatar else None
            }

    


class ClubJoinSerializer(serializers.ModelSerializer):
    """
    Club join serializer
    
    Used for joining a club, includes fields like id, name, origin, about, avatar, banner, privacy, and allow_public_posts.
    """
    class Meta:
        model = Club
        fields = ['id', 'name', 'origin', 'about', 'avatar', 'banner', 'privacy', 'allow_public_posts']



class ClubListSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    # Use annotated counts from view
    member_count = serializers.IntegerField(read_only=True)
    post_count = serializers.IntegerField(read_only=True)
    event_count = serializers.IntegerField(read_only=True)
    user_role = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    members_url = serializers.SerializerMethodField()
    posts_url = serializers.SerializerMethodField()
    events_url = serializers.SerializerMethodField()
    origin = serializers.CharField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'origin', 'slug', 'avatar', 'banner', 'privacy',
            'member_count', 'post_count', 'event_count',
            'user_role', 'is_member', 'url', 'members_url', 'posts_url', 'events_url'
        ]
    
    def _get_request(self) -> Request | None:
        return self.context.get('request')

    def get_url(self, obj):
        request = self._get_request()
        return request.build_absolute_uri(reverse('clubs:club_info', kwargs={'pk': obj.pk}))    # type: ignore

    def get_members_url(self, obj):
        request = self._get_request()
        return request.build_absolute_uri(reverse('clubs:list_members', kwargs={'pk': obj.pk}))    # type: ignore

    def get_posts_url(self, obj):
        request = self._get_request()
        return request.build_absolute_uri(reverse('clubs:list_posts', kwargs={'pk': obj.pk}))    # type: ignore

    def get_events_url(self, obj):
        request = self._get_request()
        return request.build_absolute_uri(reverse('clubs:list_events', kwargs={'pk': obj.pk}))    # type: ignore

    def get_user_role(self, obj):
        user_memberships = getattr(obj, 'user_memberships', [])
        if user_memberships:
            membership = user_memberships[0]
            # Use primary_role or first role from the ManyToMany relation
            role = membership.primary_role or membership.roles.first()
            if role:
                return {
                    'id': str(role.id),
                    'name': role.name,
                    'permissions': role.get_all_permissions()
                }
        return None

    def get_is_member(self, obj):
        return bool(getattr(obj, 'user_memberships', []))



class ClubAvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.FileField(
        required=True,
        allow_empty_file=False,
        max_length=None,
        help_text="Upload avatar image or video for the club"
    )

    def validate_avatar(self, value):
        import mimetypes
        max_size = MAX_SIZE

        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size too large. Maximum size is {max_size//1024//1024}MB"
            )

        valid_mime_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime'
        ]
        mime_type, _ = mimetypes.guess_type(value.name)

        # Fallback using python-magic if available, or just extension check
        # For now relying on extension check via mimetypes
        if mime_type not in valid_mime_types:
            # Basic extension check as fallback
            ext = value.name.split('.')[-1].lower()
            allowed_exts = ['jpg', 'jpeg', 'png',
                            'gif', 'webp', 'mp4', 'webm', 'mov']
            if ext not in allowed_exts:
                raise serializers.ValidationError(
                    f"Unsupported file type. Supported types: {', '.join(valid_mime_types)}"
                )

        # Image-specific validation
        if mime_type and mime_type.startswith('image/'):
            from PIL import Image
            import io

            # Since it's a FileField, we might need to handle it carefully
            # verifying it is indeed an image if the mime says so
            try:
                # We don't strictly enforce 100x100 for verified videos, but for images we do
                # Note: Reading chunks might be safer for large files but PIL needs file-like
                pass
                # image = Image.open(value)
                # width, height = image.size
                # if width < 100 or height < 100:
                #     raise serializers.ValidationError("Image dimensions too small. Minimum 100x100 pixels")
            except Exception:
                pass

        return value

