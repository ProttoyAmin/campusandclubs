"""Small DRF utilities used by multiple realtime views."""
from __future__ import annotations

from typing import cast

from rest_framework.request import Request

from apps.accounts.models import User
from apps.realtime.services.chat_service import ChatService

def current_user(request: Request) -> User:
    """Narrow ``request.user`` to our ``User`` model at the view boundary."""
    return cast(User, request.user)


def chat_service(request: Request) -> ChatService:
    """Build a ``ChatService`` bound to the authenticated user."""
    return ChatService(actor=current_user(request))
