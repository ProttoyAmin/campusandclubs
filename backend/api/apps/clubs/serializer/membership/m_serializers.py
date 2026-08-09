from rest_framework.request import Request
from apps.clubs.models import Membership, ApplicationStatus, Role, MembershipApplication
from rest_framework import serializers

from apps.clubs.serializers import RoleSerializer


class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipApplication
        fields = ['id', 'club', 'applicant', 'message', 'status', 'created_at']



class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    profile_picture_url = serializers.SerializerMethodField()

    # CHANGE: roles is now a list
    roles = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Role.objects.all(),
        required=False
    )
    role_details = RoleSerializer(source='roles', many=True, read_only=True)
    role_names = serializers.SerializerMethodField()
    primary_role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        required=False,
        allow_null=True
    )
    primary_role_details = RoleSerializer(
        source='primary_role', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'user_id', 'username', 'email', 'profile_picture_url',
            'roles', 'role_details', 'role_names',
            'primary_role', 'primary_role_details', 'joined_at'
        ]

    def _get_request(self)-> Request | None:
        return self.context.get('request')

    def get_profile_picture_url(self, obj):
        request = self._get_request()
        if obj.user.profile_picture:
            return request.build_absolute_uri(obj.user.profile_picture.url)
        return None

    def get_role_names(self, obj):
        return obj.role_names

    def validate(self, attrs):
        """Validate that primary_role is in roles list"""
        primary_role = attrs.get('primary_role')
        roles = attrs.get('roles', [])

        if primary_role and primary_role not in roles:
            # Add primary role to roles if not already there
            if 'roles' in attrs:
                attrs['roles'].append(primary_role)

        return attrs

    def create(self, validated_data):
        roles = validated_data.pop('roles', [])
        primary_role = validated_data.pop('primary_role', None)

        membership = Membership.objects.create(**validated_data)

        # Add roles
        if roles:
            membership.roles.set(roles)

        # Set primary role
        if primary_role:
            membership.primary_role = primary_role
            membership.save()
        elif roles:
            # Set first role as primary if no primary specified
            membership.primary_role = roles[0]
            membership.save()

        return membership

    def update(self, instance, validated_data):
        roles = validated_data.pop('roles', None)
        primary_role = validated_data.pop('primary_role', None)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update roles if provided
        if roles is not None:
            instance.roles.set(roles)

        # Update primary role if provided
        if primary_role is not None:
            instance.primary_role = primary_role

        instance.save()
        return instance


