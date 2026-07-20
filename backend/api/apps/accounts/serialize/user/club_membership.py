from rest_framework import serializers

from apps.clubs.models import Membership


class UserClubMembershipSerializer(serializers.ModelSerializer):
    """Serializer for user's club memberships"""
    from apps.clubs.models import Club, Membership
    
    club_id = serializers.CharField(source='club.id', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)
    club_slug = serializers.CharField(source='club.slug', read_only=True)
    # club_avatar = serializers.URLField(source='club.avatar', read_only=True)
    is_public = serializers.BooleanField(
        source='club.is_public', read_only=True)
    is_visible = serializers.BooleanField(
        source='club.is_visible', read_only=True)
    is_active = serializers.BooleanField(
        source='club.is_active', read_only=True)
    role_name = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()
    club_url = serializers.SerializerMethodField()
    club_avatar = serializers.SerializerMethodField()
    club_banner = serializers.SerializerMethodField()

    class Meta:
        model = Membership
        fields = ['club_id', 'club_name', 'club_slug', 'club_avatar', 'club_banner', 'is_public',
                  'is_visible', 'is_active', 'club_url', 'is_owner', 'role_name', 'role_permissions', 'joined_at']

    def get_club_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/clubs/{obj.club.id}/')
        return None

    def get_club_avatar(self, obj):
        request = self.context.get('request')
        if obj.club.avatar:
            if request:
                return request.build_absolute_uri(obj.club.avatar)
        else:
            return None

    def get_club_banner(self, obj):
        request = self.context.get('request')
        if obj.club.banner:
            if request:
                return request.build_absolute_uri(obj.club.banner)
        else:
            return None

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if not (request and request.user.is_authenticated):
            return False
        return obj.club.owner == request.user

    def get_role_name(self, obj):
        """Get role name for this membership"""
        if obj.primary_role:
            return obj.primary_role.name
        roles = list(obj.roles.all())
        if roles:
            return roles[0].name
        return "Member"

    def get_role_permissions(self, obj):
        """Get combined role permissions for this membership"""
        permissions = {
            'can_manage_members': False,
            'can_manage_posts': False,
            'can_manage_events': False,
            'can_manage_settings': False,
        }
        for role in obj.roles.all():
            role_perms = role.get_all_permissions()
            for perm_name, has_perm in role_perms.items():
                if has_perm:
                    permissions[perm_name] = True
        return permissions
