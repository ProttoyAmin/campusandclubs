from __future__ import annotations


from dataclasses import dataclass
from ..models import User
from django.http import HttpRequest
from allauth.socialaccount.internal.flows import signup as social_signup_flow
from allauth.account.internal.stagekit import get_pending_stage
from allauth.account.authentication import get_authentication_records
from .utils import get_auth_flows
from core.policies.utils import current_user

@dataclass(frozen=True)
class AuthState:
    authenticated: bool
    user: User | None
    pending_stage: str | None
    pending_signup: bool
    flows: list[dict]
    methods: list


def get_auth_state(request: HttpRequest) -> AuthState:
    authed = request.user.is_authenticated
    stage = None if authed else get_pending_stage(request)
    return AuthState(
        authenticated=authed,
        user=current_user(request) if authed else None,
        pending_stage=stage.key if stage else None,
        pending_signup=not authed and social_signup_flow.get_pending_signup(request) is not None,
        flows=get_auth_flows(request),
        methods=get_authentication_records(request)
    )