from dataclasses import dataclass

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.dtos import LoginDTO
from apps.accounts.models import User

@dataclass(frozen=True)
class AuthTokens:
    access: str
    refresh: str


def login(dto: LoginDTO) -> AuthTokens:
    username = _resolve_username(dto.username_or_email)

    user = authenticate(username=username, password=dto.password)
    if user is None:
        raise ValidationError({"username_or_email": "Invalid credentials."})

    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

    refresh = RefreshToken.for_user(user)
    return AuthTokens(access=str(refresh.access_token), refresh=str(refresh))


def _resolve_username(username_or_email: str) -> str:
    is_email = "@" in username_or_email and not username_or_email.startswith("@")
    if not is_email:
        return username_or_email

    try:
        return User.objects.get(email=username_or_email).username
    except User.DoesNotExist:
        raise ValidationError(
            {"username_or_email": "No account found with this email."}
        )