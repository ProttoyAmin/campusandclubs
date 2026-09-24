"""
Base settings shared by dev.py and prod.py.
Nothing environment-specific (DEBUG, DB, CORS, email backend, etc.) lives here.
"""

import datetime
from os import getenv
from pathlib import Path

import cloudinary

# core/settings/base.py -> core/settings -> core -> project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = getenv(
    "SECRET_KEY", "django-insecure-_lw^z^15^fgkfeps$^4mpkd*9pl**u*76hqu-w_4)80s##j_!y")

AUTH_USER_MODEL = "accounts.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# --------------------------------------------------------------------------
# Applications
# --------------------------------------------------------------------------

DJANGO_APPS = [
    "daphne",
    'django.contrib.sites',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "cloudinary",
    "rest_framework",
    "djoser",
    "corsheaders",
    "rest_framework.authtoken",
    "rest_framework_simplejwt.token_blacklist",
    "channels",
    "drf_spectacular",
    "anymail",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.headless",
    "allauth.socialaccount.providers.google",
]

LOCAL_APPS = [
    "apps.accounts",
    "apps.clubs",
    "apps.interactions",
    "apps.media",
    "apps.posts",
    "apps.connections",
    "apps.notifications",
    "apps.institutes",
    "apps.communications",
    "apps.realtime",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# --------------------------------------------------------------------------
# Middleware
# --------------------------------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# --------------------------------------------------------------------------
# DRF / JWT / Djoser / drf-spectacular
# --------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "apps.accounts.config.authentication.CookieJWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Campus & Clubs API",
    "DESCRIPTION": "Campus & Clubs Backend API",
    "SCHEMA_PATH_PREFIX": r"/api/v1",
    "COMPONENT_SPLIT_REQUEST": True,
    "VERSION": "1.0.0",
    # "POSTPROCESSING_HOOKS": [
    #     "core.openapi.hook.merge_allauth_spec",
    # ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": datetime.timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": datetime.timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
    "TOKEN_REFRESH_SERIALIZER": "apps.accounts.serialize.auth.token.RefreshTokenSerializer",
}

DJOSER = {
    "USER_CREATE_PASSWORD_RETYPE": True,
    "SEND_ACTIVATION_EMAIL": True,
    "SEND_CONFIRMATION_EMAIL": True,
    "PASSWORD_CHANGED_EMAIL_CONFIRMATION": True,
    "ACTIVATION_URL": "/activate/{uid}/{token}",
    "PASSWORD_RESET_CONFIRM_URL": "/password-reset/{uid}/{token}",
    "USERNAME_RESET_CONFIRM_URL": "/username-reset/{uid}/{token}",
    "PASSWORD_RESET_CONFIRM_RETYPE": True,
    "PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND": True,
    "SERIALIZERS": {
        "user_create_password_retype": "apps.accounts.serialize.auth.register.RegisterSerializer",
        "user_create": "apps.accounts.serialize.auth.register.RegisterSerializer",
        "user": "apps.accounts.serialize.user.profile.UserMinimalSerializer",
        "current_user": "apps.accounts.serialize.user.profile.UserProfileSerializer",
        "user_delete": "djoser.serializers.UserDeleteSerializer",
    },
    "EMAIL": {
        "activation": "apps.accounts.emails.CustomActivationEmail",
        "confirmation": "djoser.email.ConfirmationEmail",
    },
}

# --------------------------------------------------------------------------
# django-allauth (headless)
# --------------------------------------------------------------------------

SITE_ID = 1
DOMAIN = getenv("DOMAIN", "127.0.0.1")
SITE_NAME = getenv("SITE_NAME")

HEADLESS_ONLY = True
HEADLESS_CLIENTS = ('app', 'browser')
HEADLESS_SERVE_SPECIFICATION = True
HEADLESS_SERVE_CSRF_TOKEN = True

# HEADLESS_TOKEN_STRATEGY = (
#     "allauth.headless.tokens.strategies.jwt.JWTTokenStrategy"
# )

# HEADLESS_JWT_ALGORITHM = "RS256"

# HEADLESS_JWT_PRIVATE_KEY = (BASE_DIR / "jwt-private.pem").read_text(encoding="utf-8")

ACCOUNT_SIGNUP_FIELDS = [
    "email*",
    "username*",
    "password1*",
    "password2*",
]
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_ON_PASSWORD_RESET = True
ACCOUNT_LOGIN_BY_CODE_ENABLED = True
# SOCIALACCOUNT_ADAPTER = "apps.accounts.adapters.CustomSocialAccountAdapter"
SOCIALACCOUNT_AUTO_SIGNUP = True


SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_EMAIL_VERIFICATION_BY_CODE_ENABLED = True

# Cookie and Session configuration
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = "Lax"

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APPS": [
            {
                "client_id": getenv("GOOGLE_CLIENT_ID"),
                "secret": getenv("GOOGLE_CLIENT_SECRET"),
                "key": "",
            }
        ],
        "SCOPES": [
            "email",
            "profile",
        ],
    }
}

# HEADLESS_FRONTEND_URLS is environment-specific (localhost vs prod domain) -> set in dev.py / prod.py

# --------------------------------------------------------------------------
# Email (shared knobs; EMAIL_BACKEND + provider-specific block set per-env)
# --------------------------------------------------------------------------

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = getenv("EMAIL_USER")
EMAIL_HOST_PASSWORD = getenv("EMAIL_APP_PASSWORD")
EMAIL_USE_TLS = True

# --------------------------------------------------------------------------
# Channels / Redis
# --------------------------------------------------------------------------

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                {
                    "host": getenv("REDIS_HOST", "127.0.0.1"),
                    "port": int(getenv("REDIS_PORT", 6379)),
                    "socket_keepalive": True,
                    "socket_connect_timeout": 5,
                    "socket_timeout": 30,
                    "retry_on_timeout": True,
                }
            ],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}

# --------------------------------------------------------------------------
# Cloudinary / static / media
# --------------------------------------------------------------------------

cloudinary.config(
    cloud_name=getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=getenv("CLOUDINARY_KEY", ""),
    api_secret=getenv("CLOUDINARY_SECRET", ""),
    secure=True,
)

STATIC_URL = "static/"
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

# --------------------------------------------------------------------------
# Password validation / i18n
# --------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------
# App-specific (Campus & Clubs)
# --------------------------------------------------------------------------

ACTIVITY_TIMEOUT = int(getenv("ACTIVITY_TIMEOUT", 300))  # 5 minutes
HEARTBEAT_INTERVAL = int(getenv("HEARTBEAT_INTERVAL", 60))  # 1 minute

# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        # "PIL": {
        #     "level": "INFO",
        #     "handlers": ["console"],
        #     "propagate": False,
        # },
        "allauth": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
        "allauth.socialaccount": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
        "django.request": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}
