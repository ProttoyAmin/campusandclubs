"""Small DRF utilities used by multiple realtime views."""
from __future__ import annotations
from core.policies.utils import current_user

from typing import cast

from rest_framework.request import Request

from apps.accounts.models import User
from apps.realtime.services.chat_service import ChatService



def chat_service(request: Request) -> ChatService:
    """Build a ``ChatService`` bound to the authenticated user."""
    return ChatService(actor=current_user(request))
