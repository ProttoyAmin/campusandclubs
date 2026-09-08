from os import getenv

from .base import *  # noqa: F401,F403
from urllib.parse import urlparse, parse_qsl

DEBUG = False

FRONTEND_URL = getenv("FRONTEND_URL", "https://campusandclubs.com").rstrip("/")
BACKEND_DOMAIN = getenv("BACKEND_DOMAIN", "api.campusandclubs.com")
COOKIE_DOMAIN = getenv("COOKIE_DOMAIN", ".campusandclubs.com") or None

ALLOWED_HOSTS = [
    BACKEND_DOMAIN,
    *([h.strip() for h in getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]),
]

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_URL,
    f"https://{BACKEND_DOMAIN}",
    *([o.strip() for o in getenv("CSRF_TRUSTED_ORIGINS", "").split(",") if o.strip()]),
]

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    *([o.strip() for o in getenv("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]),
]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["X-CSRFToken"]

# Cookie configurations
# When frontend & backend share a domain (e.g. domain.com & api.domain.com),
# COOKIE_DOMAIN=".domain.com" allows seamless cookie sharing with SameSite=Lax.
# For completely distinct root domains, set COOKIE_DOMAIN="" and COOKIE_SAMESITE="None".
SESSION_COOKIE_DOMAIN = COOKIE_DOMAIN
CSRF_COOKIE_DOMAIN = COOKIE_DOMAIN
SESSION_COOKIE_SAMESITE = getenv("COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_SAMESITE = getenv("COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


tmpPostgres = urlparse(getenv("PG_DATABASE_URL"))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": tmpPostgres.path.replace('/', ''),      #type: ignore # // priority: low
        "USER": tmpPostgres.username,
        "PASSWORD": tmpPostgres.password,
        "HOST": tmpPostgres.hostname,
        "PORT": tmpPostgres.port,
        "OPTIONS": dict(parse_qsl(tmpPostgres.query)),      #type: ignore # // priority: low
    }
}

HEADLESS_FRONTEND_URLS = {
    "account_reset_password_from_key": f"{FRONTEND_URL}/@/auth/account/reset-password/{{key}}",
    "account_confirm_email": f"{FRONTEND_URL}/@/auth/account/verify-email/{{key}}",
    "account_signup": f"{FRONTEND_URL}/@/auth/sign-up",
    "socialaccount_login_error": f"{FRONTEND_URL}/@/auth/callback",
}

# Resend only sends to arbitrary recipients once the sending domain is
# verified — fine in prod, not fine for local testing (see dev.py).
EMAIL_BACKEND = "anymail.backends.resend.EmailBackend"
ANYMAIL = {
    "RESEND_API_KEY": getenv("RESEND_API_KEY"),
}
DEFAULT_FROM_EMAIL = "onboarding@resend.dev"
