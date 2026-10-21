"""Authentication views that delegate *directly* to django-allauth headless
views so they live under /api/v1/accounts/auth/* (our own namespace) while
using allauth's internal flows (session login, signup, logout) 1:1.

Why a thin wrapper instead of ``include('allauth.headless.urls')``:
  * Our URLs, our namespace — one API surface (``/api/v1/...``).
  * We can swap the underlying mechanism later without changing frontend URLs.
  * We keep cookie/session behaviors explicit and debuggable.

The views are intentionally simple: they hand the request straight to the
allauth class-based view built for the BROWSER client (session-cookie auth,
which is what ``HEADLESS_CLIENTS`` includes). If we ever switch to an
app/JWT client we just change ``Client.BROWSER`` → ``Client.APP`` here.
"""
from __future__ import annotations


from allauth.headless.base.response import AuthenticationResponse
from allauth.account.internal.flows import password_change
from requests import Response
from typing import Any
from allauth.headless.account.inputs import ChangePasswordInput
from allauth.decorators import rate_limit
from django.utils.decorators import method_decorator
from allauth.headless.base.views import AuthenticatedAPIView

from django.views.decorators.csrf import ensure_csrf_cookie

from allauth.headless.account.views import (
    LoginView as _AllauthLoginView,
    SignupView as _AllauthSignupView,
    SessionView as _AllauthSessionView,
    ChangePasswordView as _AllauthChangePasswordView,
    ResetPasswordView as _AllauthResetPasswordView,
)
from allauth.headless.constants import Client

from rest_framework.request import Request
from rest_framework.decorators import api_view, APIView

# ------------------------------------------------------------------ #
# Build the allauth view callables once, pinned to the BROWSER
# (session-cookie) client. This is exactly what allauth does
# internally when mounting ``/_allauth/browser/v1/auth/*`` urls.
# ------------------------------------------------------------------ #

_login_view = _AllauthLoginView.as_api_view(
    client=Client.BROWSER
)
_signup_view = _AllauthSignupView.as_api_view(
    client=Client.BROWSER
)
_session_view = _AllauthSessionView.as_api_view(
    client=Client.BROWSER
)
_change_password_view = _AllauthChangePasswordView.as_api_view(
    client=Client.BROWSER
)
_reset_password_view = _AllauthResetPasswordView.as_api_view(
    client=Client.BROWSER
)

@ensure_csrf_cookie
def login_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/login/

    Accepts allauth's LoginInput: by default ``{"username"|"email", "password"}``
    (depending on ``ACCOUNT_LOGIN_METHODS``). Returns allauth's
    AuthenticationResponse and sets the Django session cookie.
    """
    return _login_view(request, *args, **kwargs)

@ensure_csrf_cookie
def signup_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/signup/

    Accepts allauth's SignupInput (email/username/password, per
    ``ACCOUNT_SIGNUP_FIELDS``). Returns AuthenticationResponse on
    success (and logs the user in automatically, per allauth defaults).
    """
    return _signup_view(request, *args, **kwargs)

@ensure_csrf_cookie
def session_view(request: Request, *args, **kwargs):
    """GET /api/v1/accounts/auth/session/

    Returns the current session state — 401 with a flow token when not
    authenticated, or the serialized user when logged in. Useful on app
    boot.
    """
    return _session_view(request, *args, **kwargs)

def logout(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/logout/

    Logs out the current Django session and returns allauth's
    unauthenticated session response. Allauth's SessionView maps logout
    to HTTP DELETE; we accept POST (which is what browsers/frontends
    typically use) and translate.
    """
    request.method = "DELETE"
    return _session_view(request, *args, **kwargs)

@ensure_csrf_cookie
def change_password_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/change-password/"

    Accepts allauth's ChangePasswordInput (current password, new password). Returns allauth's
    AuthenticationResponse on success.
    """
    return _change_password_view(request, *args, **kwargs)


# @method_decorator(rate_limit(action="change_password"), name="handle")
class ChangePasswordView(APIView):
    input_class = ChangePasswordInput

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        assert request.user.is_authenticated  # nosec
        password_change.change_password(
            request.user, self.input.cleaned_data["new_password"]
        )
        is_set = not self.input.cleaned_data.get("current_password")
        if is_set:
            password_change.finalize_password_set(request, request.user)
        else:
            password_change.finalize_password_change(request, request.user)
        return AuthenticationResponse(request)

    def get_input_kwargs(self) -> dict:
        return {"user": self.request.user}

@ensure_csrf_cookie
def reset_password_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/reset-password/"

    Accepts allauth's ResetPasswordInput (new password). Returns allauth's
    AuthenticationResponse on success.
    """
    return _reset_password_view(request, *args, **kwargs)