from os import getenv

from .base import *  # noqa: F401,F403
from urllib.parse import urlparse, parse_qsl

DEBUG = False

ALLOWED_HOSTS = [
    "api.campusandclubs.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://campusandclubs.com",
    "https://api.campusandclubs.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://campusandclubs.com",
]
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["X-CSRFToken"]

# Same registrable domain (campusandclubs.com / api.campusandclubs.com) means
# SameSite=Lax works natively without needing SameSite=None + Secure.
SESSION_COOKIE_DOMAIN = ".campusandclubs.com"
CSRF_COOKIE_DOMAIN = ".campusandclubs.com"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


tmpPostgres = urlparse(getenv("PG_DATABASE_URL"))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": tmpPostgres.path.replace('/', ''),
        "USER": tmpPostgres.username,
        "PASSWORD": tmpPostgres.password,
        "HOST": tmpPostgres.hostname,
        "PORT": tmpPostgres.port,
        "OPTIONS": dict(parse_qsl(tmpPostgres.query)),
    }
}

HEADLESS_FRONTEND_URLS = {
    "account_reset_password_from_key": "https://campusandclubs.com/@/auth/account/reset-password/{key}",
    "account_confirm_email": "https://campusandclubs.com/@/auth/account/verify-email/{key}",
    "account_signup": "https://campusandclubs.com/@/auth/sign-up",
}

# Resend only sends to arbitrary recipients once the sending domain is
# verified — fine in prod, not fine for local testing (see dev.py).
EMAIL_BACKEND = "anymail.backends.resend.EmailBackend"
ANYMAIL = {
    "RESEND_API_KEY": getenv("RESEND_API_KEY"),
}
DEFAULT_FROM_EMAIL = "onboarding@resend.dev"
