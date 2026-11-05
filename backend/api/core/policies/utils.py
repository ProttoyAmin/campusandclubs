from typing import cast
from rest_framework.request import Request
from apps.accounts.models import User
from django.http import HttpRequest

def current_user(request: HttpRequest | Request) -> User:
    """Narrow request.user to our User model at the view/serializer boundary."""
    return cast(User, request.user)
