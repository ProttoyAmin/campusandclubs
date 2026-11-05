from django.views.decorators.csrf import ensure_csrf_cookie

from allauth.headless.account.views import (
    ResetPasswordView as _AllauthResetPasswordView,
)
from allauth.headless.constants import Client
from rest_framework.request import Request

_reset_password_view = _AllauthResetPasswordView.as_api_view(
    client=Client.BROWSER
)


@ensure_csrf_cookie
def reset_password_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/reset-password/"

    Accepts allauth's ResetPasswordInput (new password). Returns allauth's
    AuthenticationResponse on success.
    """
    return _reset_password_view(request, *args, **kwargs)