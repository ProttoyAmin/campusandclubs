"""
Serializers used by the user-scoped account endpoints that don't already
belong to an existing module (login/register, profile, private_profile,
club_membership).
"""
from allauth.account.models import EmailAddress
from rest_framework import serializers


class UserEmailSerializer(serializers.ModelSerializer):
    """A flat, frontend-friendly representation of an allauth EmailAddress."""

    class Meta:
        model = EmailAddress
        fields = ['id', 'email', 'primary', 'verified']
