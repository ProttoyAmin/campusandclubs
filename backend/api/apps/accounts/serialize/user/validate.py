from django.contrib.auth.hashers import check_password
from rest_framework import serializers


from apps.accounts.models import User
from apps.institutes.models import Institute
from apps.institutes.utils import get_email_domain_list

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
    
    def validate(self, attrs):
        user = self.context.get('request').user   # type: ignore
        password = attrs.get('password')
        professional_email = attrs.get('professional_email')
        institute = attrs.get('institute')
        user_type = attrs.get('user_type')

        if not user or not check_password(password, user.password):
            raise serializers.ValidationError({"password": "Password does not match our records."})

        # 2. Check if professional email is already in use
        if User.objects.filter(professional_email=professional_email).exclude(id=user.id).exists():
            raise serializers.ValidationError({"professional_email": "This professional email is already associated with another account."})

        # 3. Validate professional email domain and type
        domain_map = get_email_domain_list(institute)
        if not domain_map:
             raise serializers.ValidationError({"institute": "The selected institute does not have any registered email domains."})

        matched = False
        allowed_types = []
        for domain_type, domain in domain_map.items():
            if professional_email.endswith(domain):
                if domain_type == user_type:
                    matched = True
                    break
                else:
                    if domain_type not in allowed_types:
                        allowed_types.append(domain_type)
        
        if not matched:
            if allowed_types:
                raise serializers.ValidationError({
                    "professional_email": f"This email domain is registered for {', '.join(allowed_types)} type(s), but you selected {user_type}."
                })
            else:
                raise serializers.ValidationError({
                    "professional_email": f"This email domain is not authorized for {institute.name}."
                })

        return attrs