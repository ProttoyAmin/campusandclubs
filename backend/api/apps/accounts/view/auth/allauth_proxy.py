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

from django.views.decorators.csrf import ensure_csrf_cookie

from allauth.headless.account.views import (
    LoginView as _AllauthLoginView,
    SignupView as _AllauthSignupView,
    SessionView as _AllauthSessionView,
)
from allauth.headless.constants import Client


# ------------------------------------------------------------------ #
# Build the allauth view callables once, pinned to the BROWSER
# (session-cookie) client. This is exactly what allauth does
# internally when mounting ``/_allauth/browser/v1/auth/*`` urls.
# ------------------------------------------------------------------ #
_login_view = _AllauthLoginView.as_api_view(client=Client.BROWSER)
_signup_view = _AllauthSignupView.as_api_view(client=Client.BROWSER)
_session_view = _AllauthSessionView.as_api_view(client=Client.BROWSER)


@ensure_csrf_cookie
def login(request, *args, **kwargs):
    """POST /api/v1/accounts/auth/login/

    Accepts allauth's LoginInput: by default ``{"username"|"email", "password"}``
    (depending on ``ACCOUNT_LOGIN_METHODS``). Returns allauth's
    AuthenticationResponse and sets the Django session cookie.
    """
    return _login_view(request, *args, **kwargs)


@ensure_csrf_cookie
def signup(request, *args, **kwargs):
    """POST /api/v1/accounts/auth/signup/

    Accepts allauth's SignupInput (email/username/password, per
    ``ACCOUNT_SIGNUP_FIELDS``). Returns AuthenticationResponse on
    success (and logs the user in automatically, per allauth defaults).
    """
    return _signup_view(request, *args, **kwargs)


def logout(request, *args, **kwargs):
    """POST /api/v1/accounts/auth/logout/

    Logs out the current Django session and returns allauth's
    unauthenticated session response. Allauth's SessionView maps logout
    to HTTP DELETE; we accept POST (which is what browsers/frontends
    typically use) and translate.
    """
    request.method = "DELETE"
    return _session_view(request, *args, **kwargs)


def session(request, *args, **kwargs):
    """GET /api/v1/accounts/auth/session/

    Returns the current session state — 401 with a flow token when not
    authenticated, or the serialized user when logged in. Useful on app
    boot.
    """
    return _session_view(request, *args, **kwargs)
