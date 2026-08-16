from .base import *  # noqa: F401,F403
from .base import BASE_DIR, INSTALLED_APPS, MIDDLEWARE
from os import getenv

DEBUG = True

FRONTEND_URL = getenv('FRONTEND_URL', '')

ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = [
    "https://*.ngrok-free.app",
    "http://localhost:4000",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:5173",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]
# Fine for local dev only — never enable this in prod.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["X-CSRFToken"]

INTERNAL_IPS = [
    "127.0.0.1",
]

# debug_toolbar only wired up locally
INSTALLED_APPS = INSTALLED_APPS + ["debug_toolbar"]
MIDDLEWARE = MIDDLEWARE[:6] + \
    ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE[6:]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

HEADLESS_FRONTEND_URLS = {
    "account_reset_password_from_key": "http://localhost:3000/@/auth/account/reset-password/{key}",
    "account_confirm_email": "http://localhost:3000/@/auth/account/verify-email/{key}",
    "account_signup": "http://localhost:3000/@/auth/sign-up",
}

# Resend requires a verified sending domain before it'll deliver to arbitrary
# addresses, which breaks testing against random dev/test inboxes. Use plain
# SMTP (Gmail) locally instead — same backend allauth was already using
# before Resend was introduced.
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = getenv("DEFAULT_FROM_EMAIL")
