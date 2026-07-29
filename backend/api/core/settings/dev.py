"""
Development settings — selected when DEBUG=True.

Keeps the project easy to run locally: permissive ALLOWED_HOSTS, console
email backend, debug toolbar wired in, and SQLite by default.
"""

from .base import *  # noqa: F401,F403
from .base import INSTALLED_APPS, MIDDLEWARE

DEBUG = True

INTERNAL_IPS = [
    '127.0.0.1',
]

ALLOWED_HOSTS = ['*']

# Pull in debug_toolbar (app + middleware) so the /__debug__/ route works.
INSTALLED_APPS = INSTALLED_APPS + [  # noqa: F405
    'debug_toolbar',
]

MIDDLEWARE = [  # noqa: F405
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Print emails to the runserver console instead of trying SMTP.
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'