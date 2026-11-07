from __future__ import annotations


from allauth.account.adapter import get_adapter as get_account_adapter
from allauth.account.internal.flows import manage_email, password_change
from allauth.account.forms import AddEmailForm
from allauth.account.internal.flows.email_verification import send_verification_email_to_address
from allauth.account.models import EmailAddress
from allauth.headless.socialaccount.internal import complete_token_login
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.internal.flows import connect as social_connect
from allauth.core.exceptions import ImmediateHttpResponse, ReauthenticationRequired
from allauth.account.internal.flows import (
    email_verification_by_code as evc,
)
from allauth.core.ratelimit import RateLimited
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpRequest
from rest_framework.exceptions import ValidationError, NotAuthenticated, PermissionDenied, Throttled
from ..repositories import UserRepository
from ..models import User
from core.services import BaseService
from .utils import consume_rate_limit, form_errors, check_process_code, Conflict, provider_sociallogin
from .auth_service import EmailInput
from core.policies.utils import current_user
from allauth.account import app_settings as accounts_settings
from .auth_state import AuthState, get_auth_state


class CredentialService(BaseService[User, UserRepository]):
    repository_class = UserRepository

    def _require_user(self, request: HttpRequest) -> User:
        user = current_user(request)
        if not isinstance(user, User) or not user.is_authenticated:
            raise NotAuthenticated()
        return user

    def _serialize_emails(self, request: HttpRequest, user: User) -> list[dict]:
        addrs = manage_email.list_email_addresses(request, user)
        return [
            {
                "email": a.email,
                "verified": a.verified,
                "primary": a.primary,
            }
            for a in addrs
        ]

    def list_emails(self, request: HttpRequest) -> list[dict]:
        user = self._require_user(request)
        return self._serialize_emails(request, user)
    
    def add_email(self, request: HttpRequest, data: EmailInput) -> list[dict]:
        user = self._require_user(request)
        consume_rate_limit(request, "manage_email", user=user)

        form = AddEmailForm(
            data={"email": data.get("email")},
            user=user
        )

        if not form.is_valid():
            raise ValidationError(form_errors(form))

        try:
            manage_email.add_email(request, form)
        except ImmediateHttpResponse:
            raise PermissionDenied("Reauthentication required.")

        return self._serialize_emails(request, user)

    def confirm_email(self, request: HttpRequest, code: str) -> list[dict]:
        user = self._require_user(request)
        process = evc.EmailVerificationProcess.resume(request)

        # ownership check: allauth doesn't do this, but the process must belong to this user
        if not process or process.user is None or process.user.pk != user.pk:
            raise Conflict("No pending email verification. It may have expired; request a new code.")

        check_process_code(process, code)

        if not process.email_address.can_set_verified():
            raise ValidationError({"code": ["This email address is already in use."]})

        if not process.finish():
            raise ValidationError({"code": ["Could not verify this email address."]})
        
        return self._serialize_emails(request, user)

    def resend_email_code(self, request: HttpRequest, email: str) -> dict:
        user = self._require_user(request)
        consume_rate_limit(request, "manage_email", user=user)   # 10/m/user

        process = evc.EmailVerificationProcess.resume(request)
        if (process and process.user is not None and process.user.pk == user.pk
                and process.email.lower() == email.lower()):
            if not process.can_resend:
                raise Throttled(detail="Too many resends. Wait for the code to expire, then try again.")
            try:
                process.resend()
            except RateLimited:
                raise Throttled(detail="Please wait a few seconds before requesting another code.")
            sent = True
        else:
            # process expired or gone: restart from the unverified address row
            address = EmailAddress.objects.filter(user=user, email__iexact=email).first()
            if address is None:
                raise Conflict("This verification has expired. Add the email address again.")
            if address.verified:
                raise ValidationError({"email": ["This email address is already verified."]})
            sent = send_verification_email_to_address(request, address)

        return {
            "verification_sent": sent,
            "code_expires_in": accounts_settings.EMAIL_VERIFICATION_BY_CODE_TIMEOUT,
        }

    def remove_email(self, request: HttpRequest, data: EmailInput) -> list[dict]:
        user = self._require_user(request)
        consume_rate_limit(request, "manage_email", user=user)

        try:
            addrs = EmailAddress.objects.get_for_user(user=user, email=data.get("email"))       #type: ignore
        except EmailAddress.DoesNotExist:
            process = evc.EmailVerificationProcess.resume(request)

            if (
                process
                and process.email_address.email == data.get("email")
                and process.email_address.user.id == user.id
            ):
                process.abort()
                return self._serialize_emails(request, user)
            raise ValidationError({"email": ["Unknown email address."]})


        if not manage_email.can_delete_email(addrs):
            raise ValidationError({"email": ["Cannot remove the primary email."]})

        try:
            manage_email.delete_email(request, addrs)
        except ImmediateHttpResponse:
            raise PermissionDenied("Reauthentication required")

        return self._serialize_emails(request, user)
    
    def mark_email_primary(self, request: HttpRequest, email: str) -> list[dict]:
        user = self._require_user(request)
        consume_rate_limit(request, "manage_email", user=user)

        try:
            addrs = EmailAddress.objects.get_for_user(user=user, email=email)           #type: ignore
        except EmailAddress.DoesNotExist:
            raise ValidationError({"email": ["Unknown email address."]})

        if not manage_email.can_mark_as_primary(addrs):
            raise ValidationError(
                {"email": ["Unverified email cannot be marked primary."]}
            )

        try:
            manage_email.mark_as_primary(request, addrs)
        except ImmediateHttpResponse:
            raise PermissionDenied("Reauthentication required.")

        return self._serialize_emails(request, user)


    def change_password(self, request: HttpRequest, current_password: str | None, new_password: str) -> AuthState:
        user = request.user
        if not isinstance(user, User):
            raise NotAuthenticated()

        consume_rate_limit(request, "change_password", user=user)

        has_password = user.has_usable_password()

        if has_password and (not current_password or not user.check_password(current_password)):
            raise ValidationError({"current_password" : ["Incorrect password"]})

        try:
            get_account_adapter().clean_password(new_password, user=user)
        except DjangoValidationError as e:
            raise ValidationError({"new_password" : e.messages})
        
        password_change.change_password(user=user, password=new_password)
        if has_password:
            password_change.finalize_password_change(request, user)
        else:
            password_change.finalize_password_set(request, user)

        return get_auth_state(request)

    def list_providers(self, request: HttpRequest) -> list[dict]:
        user = self._require_user(request)
        return [
            {"provider": a.provider, "uid": a.uid, "display": a.get_provider_account().to_str()}
            for a in SocialAccount.objects.filter(user=user)
        ]

    def connect_provider(self, request: HttpRequest, data: dict) -> list[dict]:
        self._require_user(request)

        social = provider_sociallogin(data, "connect")

        try:
            complete_token_login(request, social)
        except DjangoValidationError as e:
            raise ValidationError({"token" : e.messages})
        except ReauthenticationRequired:
            raise PermissionDenied("Reauthentication required")

        return self.list_providers(request)

    def disconnect_provider(self, request: HttpRequest, provider: str, uid: str) -> list[dict]:
        user = self._require_user(request)
        account = SocialAccount.objects.filter(
            user=user,
            provider=provider,
            uid=uid
        )

        if account is None:
            raise ValidationError({"account" : ["Account not found"]})

        try:
            social_connect.validate_disconnect(request, account)
            social_connect.disconnect(request, account)
        except DjangoValidationError as e:
            raise ValidationError({"account" : e.messages})
        except ReauthenticationRequired:
            raise PermissionDenied("Reauthentication required")

        return self.list_providers(request)