from __future__ import annotations

from dataclasses import dataclass
from typing import TypedDict
from allauth.account.adapter import get_adapter
from allauth.account.forms import SignupForm, LoginForm, ResetPasswordForm, RequestLoginCodeForm
from allauth.account.internal.flows import (
    signup as signup_flow,
    email_verification_by_code as evc,
    password_reset,
    password_reset_by_code as reset_by_code,
    login_by_code
)
from allauth.socialaccount.internal.flows import signup as social_signup_flow
from allauth.account.internal.flows.email_verification import login_on_verification
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.account.stages import LoginStageController, EmailVerificationStage, LoginStageKey
from allauth.core.ratelimit import RateLimited
from django.core.exceptions import ValidationError as DjangoValidationError
from allauth.account import app_settings as allauth_settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError, APIException, Throttled
from rest_framework.request import Request
from apps.accounts.repositories import UserRepository
from apps.accounts.models import User
from core.policies.utils import current_user
from core.services import BaseService
from allauth.account.authentication import get_authentication_records
from allauth.core.internal.cryptokit import compare_user_code
from allauth.account.internal.stagekit import get_pending_stage
from django.http import HttpRequest
from .utils import consume_rate_limit, form_errors, get_auth_flows, Conflict, check_process_code
from .auth_state import AuthState, get_auth_state
import logging

logger = logging.getLogger(__name__)

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

class EmailInput(TypedDict):
    email: str


class AuthService(BaseService[User, UserRepository]):
    repository_class = UserRepository

    def get_state(self, request: HttpRequest) -> AuthState:
        return get_auth_state(request)


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
        consume_rate_limit(request, "login")

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
            raise ValidationError(form_errors(form))

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

        check_process_code(process, code)

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


    def request_password_reset(self, request: HttpRequest, data: EmailInput) -> dict:
        email = data.get("email")
        consume_rate_limit(request, "reset_password", key=email.lower())

        form = ResetPasswordForm(data={"email" : email})

        if not form.is_valid():
            raise ValidationError(form_errors(form))

        form.save(request=request)

        return {
            "code_expires_in" : allauth_settings.PASSWORD_RESET_BY_CODE_TIMEOUT,
            "max_attempts" : allauth_settings.PASSWORD_RESET_BY_CODE_MAX_ATTEMPTS
        }

    def _resume_reset(self, request):
        process = reset_by_code.PasswordResetVerificationProcess.resume(request)
        if not process:
            raise Conflict("No active reset request. It may have expired; request a new code.")
        return process

    def verify_reset_code(self, request: HttpRequest, code: str) -> dict:
        consume_rate_limit(request, "reset_password_from_key")

        process = self._resume_reset(request)
        check_process_code(process, code)
        process.confirm_code()
        
        return {"code_confirmed" : True}

    def confirm_password_reset(self, request: HttpRequest, code: str | None, password: str) -> AuthState:
        consume_rate_limit(request, "reset_password_from_key")
        process = self._resume_reset(request)
        user = process.user

        if user is None:
            raise Conflict("No active reset request. It may have expired; request a new code.")

        if not (user is not None and process.state.get("code_confirmed")):

            if not code:
                raise ValidationError({"code": ["This field is required."]})
            check_process_code(process, code)

        try:
            get_adapter().clean_password(password, user=user)
        except DjangoValidationError as e:
            raise ValidationError({"password1" : e.messages})

        password_reset.reset_password(user, password)
        process.confirm_code()

        try:
            process.finish()
        except ImmediateHttpResponse:
            pass

        return self.get_state(request)


    def request_login_code(self, request: HttpRequest, email: str) -> dict:
        if request.user.is_authenticated:
            raise Conflict("You are already signed in.")

        # The form rate-limits "request_login_code" itself (20/m/ip, 3/m/key).
        form = RequestLoginCodeForm(data={"email" : email})
        if not form.is_valid():
            raise ValidationError(form_errors(form))
        
        login_by_code.LoginCodeVerificationProcess.initiate(
            request=request,
            user=form._user,
            email=form.clean_email()
        )

        return {
            "pending_stage" : LoginStageKey.LOGIN_BY_CODE.value,
            "code_expires_in" : allauth_settings.LOGIN_BY_CODE_TIMEOUT,
            "max_attempts" : allauth_settings.LOGIN_BY_CODE_MAX_ATTEMPTS,
            "resends_left" : allauth_settings.LOGIN_BY_CODE_MAX_RESEND_COUNT
        }

    def confirm_login_code(self, request: HttpRequest, code: str) -> AuthState:
        if request.user.is_authenticated:
            raise Conflict("You are already signed in.")

        stage = get_pending_stage(request)

        if not stage or stage.key != LoginStageKey.LOGIN_BY_CODE:
            raise Conflict("No pending login code. It may have expired; request a new one.")

        process = login_by_code.LoginCodeVerificationProcess.resume(stage)

        if not process:
            raise Conflict("This code has expired. Request a new one.")

        check_process_code(process, code)

        try:
            process.finish(None)
        except ImmediateHttpResponse:
            pass

        return self.get_state(request)

    def resend_login_code(self, request: HttpRequest) -> dict:
        stage = LoginStageController.enter(request, LoginStageKey.LOGIN_BY_CODE)
        process = login_by_code.LoginCodeVerificationProcess.resume(stage) if stage else None
        
        if not process:
            raise Conflict("This code has expired. Request a new one.")
        
        if not process.can_resend:
            raise Throttled(detail="Too many resends. Request a new code after this one expires.")
        
        try:
            process.resend()
        except RateLimited:
            raise Throttled(detail="Please wait a few seconds before requesting another code.")
        
        return {
            "code_expires_in": allauth_settings.LOGIN_BY_CODE_TIMEOUT,
            "resends_left": allauth_settings.LOGIN_BY_CODE_MAX_RESEND_COUNT - process.state["resend_count"],
        }