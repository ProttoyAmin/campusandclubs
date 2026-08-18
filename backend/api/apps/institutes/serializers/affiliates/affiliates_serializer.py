import uuid
from django.contrib.auth.hashers import check_password
from apps.institutes.dto.affiliation.create import AffiliateCreateDTO
from requests import Request
from allauth.account.models import EmailAddress
from apps.institutes.models import Institute
from apps.accounts.models import User
from rest_framework import serializers
from apps.institutes.models import InstituteAffiliate
from apps.institutes.serializers.institute_serializers import InstituteSerializer
from apps.accounts.serialize.user.profile import UserMinimalSerializer


class InstituteAffiliateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'institute', 'user', 'role', 'verification_token', 'token_expires_at',
                  'status', 'verification_method']


class VerifyAffiliateSerializer(serializers.Serializer):
    token = serializers.UUIDField(required=True)

    def validate_token(self, value: uuid.UUID):
        from apps.institutes.services import AffiliateService
        affiliate_service = AffiliateService()
        if not affiliate_service.has_valid_token(value):
            raise serializers.ValidationError("Invalid or expired token.")

        if affiliate_service.is_verified(value):
            raise serializers.ValidationError("Affiliate is already verified.")

        return value


class InstituteAffiliateForInstituteSerializer(serializers.ModelSerializer):
    """Used in Institute details — shows which users (students) belong to it."""

    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'user', 'role']


class InstituteAffiliateForUserSerializer(serializers.ModelSerializer):
    """Used in User details — shows which institute the user belongs to."""
    institute = InstituteSerializer(
        read_only=True)  # or InstituteMinimalSerializer

    class Meta:
        model = InstituteAffiliate
        fields = ['id', 'institute', 'role', 'status']


class ClaimAffiliateSerializer(serializers.Serializer):
    """Serializer for assigning a role to a user in a club"""
    role = serializers.ChoiceField(
        choices=User.USER_TYPES, required=True, allow_null=False)
    institute = serializers.PrimaryKeyRelatedField(
        queryset=Institute.objects.filter(is_active=True),
        required=True,
        allow_null=False
    )
    email = serializers.PrimaryKeyRelatedField(
        queryset=EmailAddress.objects.none(),
        required=True,
        allow_null=False,
    )
    password = serializers.CharField(write_only=True, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.get_request()
        if request and request.user and request.user.is_authenticated:
            self.fields["email"].queryset = EmailAddress.objects.filter(
                user=request.user, verified=True
            )

    def get_request(self) -> Request:
        return self.context.get('request')

    def validate(self, attrs: AffiliateCreateDTO):
        from apps.institutes.utils import get_email_domain_list
        from apps.accounts.services import AccountService
        from apps.institutes.services import AffiliateService
        from apps.institutes.repositories import AcademicRepository

        academic_repository = AcademicRepository()
        affiliate_service = AffiliateService()
        account_service = AccountService()
        request = self.get_request()
        user: User = request.user
        password = attrs.get('password')
        email_obj = attrs.get('email')
        professional_email = email_obj.email
        institute = attrs.get('institute')
        role = attrs.get('role')

        if affiliate_service.does_exist(user.id, institute.id):
            raise serializers.ValidationError({
                "email": "You already have an affiliation with this institute.",
            })

        if not user or not check_password(password, user.password):
            raise serializers.ValidationError(
                {"password": "Password does not match our records."})

        if academic_repository.academic_email_exists(professional_email):
            raise serializers.ValidationError({
                "email": "This email is already associated with another user."
            })

        # if affiliate_service.email_exists(professional_email, institute.id):
        #     raise serializers.ValidationError({
        #         "email": "This email is already associated with another user in this institute."
        #     })

        domain_map = get_email_domain_list(institute.id)
        if not domain_map:
            raise serializers.ValidationError({
                "institute": "The selected institute does not have any registered email domains."
            })

        if role not in domain_map:
            raise serializers.ValidationError({
                "role": f"This institute does not have any registered email domains for {role}s."
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
                "email": f"This email domain is not authorized for {institute.name}. Add your authorized email to resume"
            })

        if best_type != role:
            raise serializers.ValidationError({
                "email": f"This email is not registered for {role}s."
            })

        return attrs
