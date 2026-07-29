import logging

from rest_framework import serializers
from rest_framework.validators import UniqueValidator


from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


from typing import TypedDict

from apps.accounts import models

logger = logging.getLogger(__name__)


class RegisterSerializerData(TypedDict):
    """
    Typed dictionary for register serializer data.
    """
    username: str
    email: str
    password: str
    re_password: str

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    username = serializers.CharField(
        required=True,
        validators=[
            UnicodeUsernameValidator(),
            UniqueValidator(
                queryset=models.User.objects.all(),
                message="Username already exists",
            )
        ]
    )

    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=models.User.objects.all(),
                message="Email already exists"
            ),
        ]
    )

    re_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = models.User
        fields = ["id", "username", "email", "password",
                  "re_password"]
        extra_kwargs = {
            'password': {'write_only': True},
        }


    def validate_password(self, value: str) -> str:
        try:
            validate_password(
                password=value,
                user=models.User(
                    username=self.initial_data.get("username"),
                    email=self.initial_data.get("email"),
                )
            )
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs: RegisterSerializerData) -> RegisterSerializerData:
        logger.debug("Validating registration data: %s", attrs)


        if attrs.get('password') != attrs.get('re_password'):
            raise serializers.ValidationError(
                {"re_password": "Passwords do not match"})

        return attrs

    def create(self, validated_data) -> models.User:
        validated_data.pop('re_password')
        password = validated_data.pop('password')

        user = models.User(**validated_data)
        user.set_password(password)
        user.is_active = False  # Requires email verification
        user.save()

        return user

