from apps.accounts.models import User
from rest_framework import serializers
from apps.institutes.models import InstituteAffiliate
from apps.institutes.serializers.institute_serializers import InstituteSerializer
from apps.accounts.serialize.user.profile import UserMinimalSerializer



class InstituteAffiliateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'institute', 'user', 'role']

class InstituteAffiliateForInstituteSerializer(serializers.ModelSerializer):
    """Used in Institute details — shows which users (students) belong to it."""

    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'user', 'role']


class InstituteAffiliateForUserSerializer(serializers.ModelSerializer):
    """Used in User details — shows which institute the user belongs to."""
    institute = InstituteSerializer(read_only=True)  # or InstituteMinimalSerializer

    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'institute', 'role']