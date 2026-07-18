from typing import cast
from rest_framework.request import Request
from apps.accounts.models import User

def current_user(request: Request) -> User:
    """Narrow request.user to our User model at the view/serializer boundary."""
    return cast(User, request.user)
