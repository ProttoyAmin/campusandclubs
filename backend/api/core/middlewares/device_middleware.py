import secrets

from typing import Any
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from apps.accounts.services.security_service import DEVICE_COOKIE, DEVICE_COOKIE_MAX_AGE


class DeviceCookieMiddleware:

    def __init__(self, get_response) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest, *args: Any, **kwds: Any) -> HttpResponse:
        
        token = request.COOKIES.get(DEVICE_COOKIE)

        if not token or len(token) != 43:
            token = secrets.token_urlsafe(32)
            setattr(request, "_device_token", token)
            should_set_cookie = True
        else:
            setattr(request, "_device_token", token)
            should_set_cookie = False

        response: HttpResponse = self.get_response(request)

        if should_set_cookie:
            response.set_cookie(
                key=DEVICE_COOKIE,
                value=token,
                max_age=DEVICE_COOKIE_MAX_AGE,
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                path="/"
            )

        return response