from dataclasses import dataclass

from allauth.account.adapter import get_adapter
from allauth.account.forms import SignupForm, LoginForm
from allauth.account.internal.flows import (
    signup as signup_flow,
    email_verification_by_code as evc
)
from allauth.account.internal.flows.email_verification import login_on_verification
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.account.stages import LoginStageController, EmailVerificationStage
from allauth.core.ratelimit import RateLimited
from allauth.core import ratelimit
from django.conf import settings
from allauth.account import app_settings as allauth_settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError, APIException, Throttled
from rest_framework.request import Request
from apps.accounts.repositories import UserRepository
from apps.accounts.models import User
from core.policies.utils import current_user
from core.services import BaseService
from allauth.core.internal.cryptokit import compare_user_code
from allauth.account.internal.stagekit import get_pending_stage
from django.http import HttpRequest
import logging

logger = logging.getLogger(__name__)

class Conflict(APIException):
    status_code = 409
    default_detail = "You are already signed in."
    default_code = "conflict"


@dataclass(frozen=True)
class SignupResult:
    email: str
    verification_required: bool
    code_expires_in: int | None
    max_attempts: int | None

@dataclass(frozen=True)
class ConfirmResult:
    email: str
    authenticated: bool
    user: User | None

@dataclass(frozen=True)
class AuthState:
    authenticated: bool
    user: User | None
    pending_stage: str | None 


class AuthService(BaseService[User, UserRepository]):
    repository_class = UserRepository

    @staticmethod
    def _rate_limit(request: HttpRequest, action: str) -> None:
        try:
            ratelimit.consume(request, action=action, raise_exception=True)

        except RateLimited:
            raise Throttled(detail="Too many attempts. Try again in a minute")

    @staticmethod
    def _form_errors(form) -> dict:
        return {
            ("non_field_errors" if f == "__all__" else f): [str(e) for e in errs]
            for f, errs in form.errors.items()
        }

    def get_state(self, request: HttpRequest) -> AuthState:
        authed = request.user.is_authenticated
        stage = None if authed else get_pending_stage(request)
        return AuthState(
            authenticated=authed,
            user=current_user(request) if authed else None,
            pending_stage=stage.key if stage else None,
        )



    @staticmethod
    def signup(request: HttpRequest, data: dict):
        if request.user.is_authenticated:
            raise Conflict()

        if not get_adapter(request).is_open_for_signup(request):
            raise PermissionDenied("Signups are currently closed")

        form = SignupForm(data=data)
        if not form.is_valid():
            raise ValidationError(
                {field: [str(e) for e in errs] for field, errs in form.errors.items()}
            )


        # with transaction.atomic():
        #     user, resp = form.try_save(request)
        user, resp = form.try_save(request)

        if user is not None and not resp:
            try:
                signup_flow.complete_signup(request, user=user)
            except ImmediateHttpResponse:
                pass

        pending = not request.user.is_authenticated

        return SignupResult(
            email=data['email'],
            verification_required=pending,
            code_expires_in=allauth_settings.EMAIL_VERIFICATION_BY_CODE_TIMEOUT if pending else None,
            max_attempts=allauth_settings.EMAIL_VERIFICATION_BY_CODE_MAX_ATTEMPTS if pending else None,
        )

    def login(self, request: HttpRequest, data: dict) -> AuthState:
        self._rate_limit(request, "login")

        if request.user.is_authenticated:
            raise Conflict("You are already signed in")
        
        form = LoginForm(
            data={
                "login" : data["login"],
                "password" : data["password"],
                "remember" : data["remember"]
            },
            request=request
        )

        if not form.is_valid():
            raise ValidationError(self._form_errors(form))

        try:
            form.login(request=request)
        except ImmediateHttpResponse:
            pass

        state = self.get_state(request)
        
        if not state.authenticated and state.pending_stage is None:
            raise PermissionDenied("This account cannot sign in right now")

        return state

    def logout(self, request: HttpRequest) -> AuthState:
        get_adapter().logout(request)
        return self.get_state(request)

    def confirm_email_code(self, request: HttpRequest, code: str) -> ConfirmResult:

        if request.user.is_authenticated:
            raise Conflict("You are already signed in")

        stage = LoginStageController.enter(request, EmailVerificationStage.key)
        process = evc.EmailVerificationProcess.resume(request)

        if not stage or not process:
            raise Conflict("No pending verification. It may have been expired. Please request a new one")

        if process.user is None and compare_user_code(actual=code, expected=process.code):
            has_attempts_left = process.record_invalid_attempt()

            if not has_attempts_left:
                raise Conflict("Too many incorrect attempts. Please login again to get a new code")

            left = process.max_attempts - process.state["failed_attempts"]
            raise ValidationError({
                "code" : [
                    f"Incorrect code. {left} attempt(s) left"
                ]
            })

        email_address = process.email_address
        if not email_address.can_set_verified():
            raise ValidationError({"code" : ["This email cannot be verified."]})


        email_address = process.finish()

        try:
            login_on_verification(request, email_address)
        except ImmediateHttpResponse:
            pass

        authed = request.user.is_authenticated

        return ConfirmResult(
            email=email_address.email,                  #type: ignore
            authenticated=authed,
            user=current_user(request) if authed else None
        )


    def resend_email_code(self, request: HttpRequest) -> dict:
        process = evc.EmailVerificationProcess.resume(request)

        if not process or not process.can_resend:
            raise Conflict("Can't resend a code right now")

        try:
            process.resend()
        except RateLimited:
            raise Throttled(detail="Please wait a few seconds before requesting another code")

        return {
            "code_expires_in": allauth_settings.EMAIL_VERIFICATION_BY_CODE_TIMEOUT,
            "resends_left": allauth_settings.EMAIL_VERIFICATION_MAX_RESEND_COUNT
                            - process.state["resend_count"],
        }