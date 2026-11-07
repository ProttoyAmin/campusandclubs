from __future__ import annotations

from allauth.socialaccount.internal.flows import signup as social_signup_flow
from allauth.socialaccount.adapter import get_adapter as get_socialaccount_adapter
from allauth.socialaccount.forms import SignupForm as SocialSignUpForm
from allauth.headless.socialaccount.internal import complete_token_login
from allauth.core.exceptions import ImmediateHttpResponse, SignupClosedException
from allauth.core.ratelimit import RateLimited
from django.core.exceptions import ValidationError as DjangoValidationError
from allauth.account import app_settings as allauth_settings
from rest_framework.exceptions import PermissionDenied, ValidationError, APIException, Throttled
from apps.accounts.repositories import UserRepository
from apps.accounts.models import User
from core.policies.utils import current_user
from core.services import BaseService
from django.http import HttpRequest
from .utils import consume_rate_limit, form_errors, get_auth_flows, Conflict, provider_sociallogin
from .auth_state import AuthState, get_auth_state

import logging

logger = logging.getLogger(__name__)

class SocialAccountService(BaseService[User, UserRepository]):
    repository_class = UserRepository

    def login_with_provider(self, request: HttpRequest, data: dict) -> AuthState:
        if request.user.is_authenticated:
            raise Conflict("You are already signed in.")

        consume_rate_limit(request, "login")
        sociallogin = provider_sociallogin(data=data, process="login")

        try:
            complete_token_login(request, sociallogin)
        except DjangoValidationError as e:
            raise ValidationError({"token" : e.messages})
        except SignupClosedException:
            raise PermissionDenied("Signups are currently closed")
        except ImmediateHttpResponse:
            pass

        state = get_auth_state(request)

        if not (state.authenticated or state.pending_stage or state.pending_signup):
            raise PermissionDenied("This account cannot sign in right now")

        return state

    def get_pending_provider_signup(self, request: HttpRequest) -> dict:
        sociallogin = social_signup_flow.get_pending_signup(request)

        if not sociallogin:
            raise Conflict("No pending social signup")

        return {
            "provider" : sociallogin.account.provider,
            "email" : next((
                e.email for e in sociallogin.email_addresses
            ), None)
        }

    def complete_provider_signup(self, request: HttpRequest, data: dict) -> AuthState:
        social = social_signup_flow.get_pending_signup(request)

        if not social:
            raise Conflict("No pending social signup.")
        
        if not get_socialaccount_adapter().is_open_for_signup(request, social):
            raise PermissionDenied("Sign-ups are currently closed.")

        form = SocialSignUpForm(data=data, sociallogin=social)
        if not form.is_valid():
            raise ValidationError(form_errors(form))
        
        try:
            social_signup_flow.signup_by_form(request=request, sociallogin=social, form=form)
        except ImmediateHttpResponse:
            pass

        return get_auth_state(request)