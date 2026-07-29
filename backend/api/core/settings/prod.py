"""
Production settings — selected when DEBUG is not 'True'.

Hardens the defaults from base.py: real SECRET_KEY required, ALLOWED_HOSTS
restricted to env-configured domains, optional Postgres via DATABASE_URL,
HTTPS-only cookies, HSTS enabled, and debug_toolbar stripped.
"""

import os

from .base import *  # noqa: F401,F403
from .base import INSTALLED_APPS, MIDDLEWARE  # noqa: F401


DEBUG = False


def _required_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f'{name} must be set in production. Refusing to start with '
            f'a missing required environment variable.'
        )
    return value


# Real secret key required in production — base.py's placeholder will not be used.
SECRET_KEY = _required_env('DJANGO_SECRET_KEY')

# ALLOWED_HOSTS comes from env as a comma-separated list.
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get('ALLOWED_HOSTS', '').split(',')
    if h.strip()
]
if not ALLOWED_HOSTS:
    raise RuntimeError(
        'ALLOWED_HOSTS must be set in production (comma-separated).'
    )


# Drop debug_toolbar from INSTALLED_APPS (it was never added by base.py,
# but explicit removal protects against a future base.py change).
INSTALLED_APPS = [  # noqa: F405
    app for app in INSTALLED_APPS  # noqa: F405
    if app != 'debug_toolbar'
]

# Drop the DebugToolbarMiddleware even if it ends up in MIDDLEWARE.
MIDDLEWARE = [  # noqa: F405
    m for m in MIDDLEWARE  # noqa: F405
    if m != 'debug_toolbar.middleware.DebugToolbarMiddleware'
]


# HTTPS / cookie hardening (assume a TLS-terminating proxy in front).
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31_536_000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'


# Optional Postgres via DATABASE_URL. We import lazily so dev environments
# that don't have dj-database-url installed keep working.
if os.environ.get('DATABASE_URL'):
    try:
        import dj_database_url
    except ImportError as exc:
        raise RuntimeError(
            "DATABASE_URL is set but dj-database-url isn't installed. "
            "Add it to your production dependencies."
        ) from exc

    DATABASES = {  # noqa: F405
        'default': dj_database_url.config(
            env='DATABASE_URL', conn_max_age=600
        )
    }