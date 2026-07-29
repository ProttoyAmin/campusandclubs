"""
Base Django settings shared by every environment.

Environment-specific overrides live in dev.py and prod.py. The settings
package's __init__.py dispatches to the right profile based on DEBUG.
"""

from pathlib import Path
import datetime
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

dotenv_file = BASE_DIR / '.env.local'

if path.isfile(dotenv_file):
    load_dotenv(dotenv_file)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
# SECURITY WARNING: keep the secret key used in production secret!
# In production this MUST be overridden via DJANGO_SECRET_KEY (see prod.py).
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-_lw^z^15^fgkfeps$^4mpkd*9pl**u*76hqu-w_4)80s##j_!y',
)


# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # third parties
    'rest_framework',
    'djoser',
    'corsheaders',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'channels',
    'drf_spectacular',

    # my apps
    'apps.accounts',
    'apps.clubs',
    'apps.interactions',
    'apps.posts',
    'apps.connections',
    'apps.notifications',
    'apps.institutes',
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:4000",  # Your React/Next.js dev server
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:3000",
    # Add your production domain here
]

CORS_ALLOW_CREDENTIALS = True  # Important for cookies

CSRF_TRUSTED_ORIGINS = [
    "https://*.ngrok-free.app",
]


AUTH_USER_MODEL = "accounts.User"


# logging
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
}


REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Campus & Clubs API",
    "DESCRIPTION": "Campus & Clubs Backend API",
    "VERSION": "1.0.0",
    "PREPROCESSING_HOOKS": [
        "core.openapi.hook.accounts_only",
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    "ALGORITHM": "HS256",
    'AUTH_HEADER_TYPES': ('Bearer',),
}


DJOSER = {
    'USER_CREATE_PASSWORD_RETYPE': True,
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'ACTIVATION_URL': '/activate/{uid}/{token}',
    'PASSWORD_RESET_CONFIRM_URL': '/password-reset/{uid}/{token}',
    'USERNAME_RESET_CONFIRM_URL': '/username-reset/{uid}/{token}',
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'PASSWORD_RESET_SHOW_EMAIL_NOT_FOUND': True,
    # 'TOKEN_MODEL': None,  # We are using JWT instead of default token model
    'SERIALIZERS': {
        'user_create_password_retype': 'apps.accounts.serialize.auth.register.RegisterSerializer',
        'user_create': 'apps.accounts.serialize.auth.register.RegisterSerializer',
        'user': 'apps.accounts.serialize.user.profile.UserSerializer',
        'current_user': 'apps.accounts.serialize.user.profile.UserSerializer',
        'user_delete': 'djoser.serializers.UserDeleteSerializer',
    },
    'EMAIL': {
        'activation': 'apps.accounts.emails.CustomActivationEmail',
        'confirmation': 'djoser.email.ConfirmationEmail',
    }
}

DOMAIN = os.environ.get('DOMAIN', '127.0.0.1')
SITE_NAME = os.environ.get('SITE_NAME')

# Each environment is responsible for filling ALLOWED_HOSTS.
# We start empty so prod can't accidentally inherit dev's permissive value.
ALLOWED_HOSTS = []


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',  # enabled in dev.py only
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Email configuration (SMTP defaults — overridden in dev.py with the console backend)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_APP_PASSWORD')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Channels Configuration
ASGI_APPLICATION = 'core.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.environ.get('REDIS_HOST', '127.0.0.1'),
                       int(os.environ.get('REDIS_PORT', 6379)))],
            "capacity": 1500,
            "expiry": 10,
        },
    },
}

# Activity Tracking Settings
ACTIVITY_TIMEOUT = int(os.environ.get('ACTIVITY_TIMEOUT', 300))  # 5 minutes
HEARTBEAT_INTERVAL = int(os.environ.get('HEARTBEAT_INTERVAL', 60))  # 1 minute