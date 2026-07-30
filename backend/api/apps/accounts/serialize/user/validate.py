from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from rest_framework.request import Request
import logging

from apps.accounts.models import User
from apps.institutes.models import Institute
from apps.institutes.services.institute_affiliate import AffiliateCreateDTO

logger = logging.getLogger(__name__)  # __name__ is the name of the current module


class UserTypeSerializer(serializers.Serializer):
    """Serializer for assigning a role to a user in a club"""
    user_type = serializers.ChoiceField(choices=User.USER_TYPES, required=True, allow_null=False)
    institute = serializers.PrimaryKeyRelatedField(
        queryset=Institute.objects.filter(is_active=True),
        required=True,
        allow_null=False
    )
    professional_email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def get_request(self) -> Request | None:
        return self.context.get('request')
    
    
    def validate(self, attrs):
        from apps.institutes.utils import get_email_domain_list
        from apps.accounts.services import AccountService

        account_service = AccountService()
        request = self.get_request()
        user: User = request.user  # type: ignore
        password = attrs.get('password')
        professional_email = attrs.get('professional_email')
        institute = attrs.get('institute')
        user_type = attrs.get('user_type')

        if account_service.has_professional_email(user.id):
            raise serializers.ValidationError({
                "professional_email": "You already have a professional email associated with your account.",
            })

        if not user or not check_password(password, user.password):
            raise serializers.ValidationError({"password": "Password does not match our records."})

        if account_service.professional_email_exists(professional_email):
            raise serializers.ValidationError({
                "professional_email": "This professional email is already associated with another account."
            })

        domain_map = get_email_domain_list(institute.id)
        if not domain_map:
            raise serializers.ValidationError({
                "institute": "The selected institute does not have any registered email domains."
            })

        if user_type not in domain_map:
            raise serializers.ValidationError({
                "user_type": f"This institute does not have any registered email domains for {user_type}s."
            })

        # Pick the most specific (longest) domain that actually matches the email,
        # rather than trusting endswith() against only the claimed type's domain.
        # Prevents e.g. faculty domain "iut.edu" matching a student email at
        # "student.iut.edu" just because it's a suffix.
        best_type, best_len = None, -1
        for domain_type, domain in domain_map.items():
            if professional_email.endswith(domain) and len(domain) > best_len:
                best_type, best_len = domain_type, len(domain)

        if best_type is None:
            raise serializers.ValidationError({
                "professional_email": f"This email domain is not authorized for {institute.name}."
            })

        if best_type != user_type:
            raise serializers.ValidationError({
                "professional_email": f"This email is not registered for {user_type}s."
            })

        return attrs
