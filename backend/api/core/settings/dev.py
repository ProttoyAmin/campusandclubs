from .base import *  # noqa: F401,F403
from .base import BASE_DIR, INSTALLED_APPS, MIDDLEWARE
from os import getenv

DEBUG = True

FRONTEND_URL = getenv('FRONTEND_URL', '')

ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = [
    "https://*.ngrok-free.app",
    "https://*.ngrok-free.dev",
    "http://localhost:4000",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:4200",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:4200",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "http://localhost:4000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://*"
]
# Fine for local dev only — never enable this in prod.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ["X-CSRFToken"]

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

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
    "account_confirm_email": "http://localhost:3000/@/auth/account/verify-email/{key}",
    "account_reset_password": "http://localhost:3000/@/auth/account/reset-password",
    "account_reset_password_from_key": "http://localhost:3000/@/auth/account/reset-password/{key}",
    "account_signup": "http://localhost:3000/@/auth/sign-up",
    "socialaccount_login_error": "http://localhost:3000/@/auth/callback",
}

# Resend requires a verified sending domain before it'll deliver to arbitrary
# addresses, which breaks testing against random dev/test inboxes. Use plain
# SMTP (Gmail) locally instead — same backend allauth was already using
# before Resend was introduced.
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = getenv("DEFAULT_FROM_EMAIL")

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.accounts.config.authentication.CookieJWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "core.exceptions.api_exception_handler",
}



# --------------------------------------------------------------------------
# Caches / Channels / Redis
# --------------------------------------------------------------------------
from redis.maint_notifications import MaintNotificationsConfig
DISABLED_MAINT_NOTIFICATIONS = MaintNotificationsConfig(enabled=False)

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": f"redis://{getenv("REDIS_HOST", "127.0.0.1")}:{int(getenv("REDIS_PORT", 6379))}/1",
        "KEY_PREFIX": "myapp",
        "TIMEOUT": 300,                 # default 5 minutes
        "OPTIONS": {
            "maint_notifications_config" : DISABLED_MAINT_NOTIFICATIONS
        }
    }
}


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
        "CONFIG": {
            "hosts": [
                {
                    "host": getenv("REDIS_HOST", "127.0.0.1"),
                    "port": int(getenv("REDIS_PORT", 6379)),
                    "socket_keepalive": True,
                    "socket_connect_timeout": 5,
                    "socket_timeout": 30,
                    "retry_on_timeout": True,
                    "maint_notifications_config" : DISABLED_MAINT_NOTIFICATIONS
                }
            ],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}


# CELERY_BROKER_URL = getenv(
#     "CELERY_BROKER_URL",
#     f"redis://{getenv('REDIS_HOST', '127.0.0.1')}:{getenv('REDIS_PORT', 6379)}/1",
# )  # db 1, so it stays separate from the Channels layer
# CELERY_TIMEZONE = "UTC"




# --------------------------------------------------------------------------
# Storage / Media
# --------------------------------------------------------------------------
MEDIA_STORAGE_BACKEND = "local"
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS" : {
            "location" : BASE_DIR / "storage",
            "base_url" : "http://localhost:8000/storage/"
        }
    },
    "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
}
MEDIA_URL = "/storage/"
MEDIA_ROOT = BASE_DIR / "storage"