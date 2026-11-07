
from allauth.account.internal.flows.code_verification import AbstractCodeVerificationProcess
from allauth.core import ratelimit
from allauth.headless.socialaccount.inputs import ProviderTokenInput
from allauth.core.exceptions import RateLimited
from allauth.socialaccount.models import SocialLogin
from rest_framework.exceptions import Throttled
from allauth import app_settings as allauth_settings
from allauth.account import app_settings as account_settings
from allauth.account.adapter import get_adapter as get_account_adapter
from allauth.account.internal.stagekit import get_pending_stage, LOGIN_SESSION_KEY
from allauth.headless.constants import Flow, Client
from allauth.account.internal.flows import password_reset_by_code
from django.http import HttpRequest
from types import SimpleNamespace
from rest_framework.exceptions import ValidationError, APIException
from allauth.core.internal.cryptokit import compare_user_code

class Conflict(APIException):
    status_code = 409
    default_detail = "You are already signed in."
    default_code = "conflict"



def provider_sociallogin(data: dict, process: str) -> SocialLogin:
    inp = ProviderTokenInput(data={"provider": data["provider"], "process": process, "token": data["token"]})
    if not inp.is_valid():
        raise ValidationError(form_errors(inp))
    return inp.cleaned_data["sociallogin"]


def check_process_code(process: AbstractCodeVerificationProcess, code: str) -> None:
    """Works for any allauth code-verification process (email, password reset)."""
    if process.user is None or not compare_user_code(actual=code, expected=process.code):

        if not process.record_invalid_attempt():
            raise Conflict("Too many incorrect attempts. Request a new code.")
        
        left = process.max_attempts - process.state["failed_attempts"]
        raise ValidationError({"code": [f"Incorrect code. {left} attempt(s) left."]})



def consume_rate_limit(request: HttpRequest, action: str, key: str | None = None, user=None) -> None:
    try:
        ratelimit.consume(request, action=action, key=key, user=user, raise_exception=True)
    except RateLimited:
        raise Throttled(detail="Too many attempts. Try again in a minute.")


def form_errors(form) -> dict:
    return {
        ("non_field_errors" if f == "__all__" else f): [str(e) for e in errs]
        for f, errs in form.errors.items()
    }


def _ensure_headless_client(request, client=Client.BROWSER):
    """Headless views set this; our DRF views don't."""
    if not hasattr(request, "allauth"):
        request.allauth = SimpleNamespace()
    if not hasattr(request.allauth, "headless"):
        request.allauth.headless = SimpleNamespace(client=client)


def get_auth_flows(request: HttpRequest) -> list[dict]:
    """Same shape as allauth headless session flows."""
    _ensure_headless_client(request)
    ret: list[dict] = []
    user = request.user

    if user.is_authenticated:
        from allauth.account.internal.flows import reauthentication
        ret.extend(reauthentication.get_reauthentication_flows(user))           #type: ignore
    else:
        if not allauth_settings.SOCIALACCOUNT_ONLY:
            ret.append({"id": Flow.LOGIN})
        if account_settings.LOGIN_BY_CODE_ENABLED:
            ret.append({"id": Flow.LOGIN_BY_CODE})
        if (
            get_account_adapter().is_open_for_signup(request)
            and not allauth_settings.SOCIALACCOUNT_ONLY
        ):
            ret.append({"id": Flow.SIGNUP})
        if allauth_settings.SOCIALACCOUNT_ENABLED:
            from allauth.headless.socialaccount.response import provider_flows
            ret.extend(provider_flows(request))
        if allauth_settings.MFA_ENABLED:
            from allauth.mfa import app_settings as mfa_settings
            if mfa_settings.PASSKEY_LOGIN_ENABLED:
                ret.append({"id": Flow.MFA_LOGIN_WEBAUTHN})

    # pending stage (verify_email, mfa_authenticate, …)
    stage = get_pending_stage(request)
    stage_key = stage.key if stage else None
    if not stage_key:
        lsk = request.session.get(LOGIN_SESSION_KEY)
        if isinstance(lsk, str):
            stage_key = lsk
    if stage_key:
        pending = {"id": stage_key, "is_pending": True}
        # upsert
        existing = next((f for f in ret if f["id"] == stage_key), None)
        if existing:
            existing.update(pending)
        else:
            ret.append(pending)

    if (
        not allauth_settings.SOCIALACCOUNT_ONLY
        and account_settings.PASSWORD_RESET_BY_CODE_ENABLED
    ):
        ret.append(
            {
                "id": Flow.PASSWORD_RESET_BY_CODE,
                "is_pending": bool(
                    password_reset_by_code.PasswordResetVerificationProcess.resume(request)
                ),
            }
        )

    return ret