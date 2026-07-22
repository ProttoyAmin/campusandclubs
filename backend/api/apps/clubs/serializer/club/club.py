from django.db.models import Value
from django.db.models.functions import Lower, Replace
from django.urls import reverse
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework.request import Request

from apps.clubs.models import Club

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
        name = attrs.get('name')
        origin = attrs.get('origin')

        instance = self.instance

        if name:
            # Normalize the input name for comparison
            normalized_name = name.strip().replace(" ", "").lower()

            # Check for existing clubs with same normalized name and origin
            # We use Replace to remove spaces and Lower for case-insensitivity on the DB side
            queryset = Club.objects.annotate(
                normalized_name_db=Lower(
                    Replace('name', Value(' '), Value('')))
            ).filter(
                normalized_name_db=normalized_name,
                origin=origin
            )

            if instance:
                queryset = queryset.exclude(pk=instance.pk)

            if queryset.exists():
                origin_name = origin.name if origin else "Global"
                raise serializers.ValidationError({
                    'name': f'A club with a very similar name already exists for "{origin_name}". Please choose a more distinct name.'
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
                'avatar': obj.owner.avatar.url if obj.owner.avatar else None
            }

    


class ClubJoinSerializer(serializers.ModelSerializer):
    """
    Club join serializer
    
    Used for joining a club, includes fields like id, name, origin, about, avatar, banner, privacy, and allow_public_posts.
    """
    class Meta:
        model = Club
        fields = ['id', 'name', 'origin', 'about', 'avatar', 'banner', 'privacy', 'allow_public_posts']
