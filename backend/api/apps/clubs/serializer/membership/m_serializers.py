from apps.clubs.models import Membership, ApplicationStatus
from rest_framework import serializers


class MembershipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = "__all__"
