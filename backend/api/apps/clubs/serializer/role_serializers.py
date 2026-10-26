from rest_framework import serializers
from apps.clubs.models import Role

class RoleSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    user_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'permissions', 'is_default',
            'color', 'user_count'
        ]
        read_only_fields = ['id']

    def get_user_count(self, obj):
        """Get count of users with this role"""
        return obj.user_count() if hasattr(obj, 'user_count') else 0