"""
Settings package entry point.

Loads `.env.local` / `.env` and dispatches to dev.py or prod.py based on
the DEBUG env var. Existing entry points (manage.py, core/wsgi.py,
core/asgi.py) keep using DJANGO_SETTINGS_MODULE=core.settings unchanged.

Override dispatch by setting DJANGO_SETTINGS_PROFILE=dev|prod explicitly.
"""

import os
from pathlib import Path

import dotenv


# Base of the Django project (backend/api). Matches what the old
# settings.py computed as BASE_DIR.
_BASE_DIR = Path(__file__).resolve().parent.parent.parent

for _env_name in ('.env.local', '.env'):
    _env_file = _BASE_DIR / _env_name
    if _env_file.is_file():
        dotenv.load_dotenv(_env_file)


_profile = os.environ.get('DJANGO_SETTINGS_PROFILE')
if _profile is None:
    _profile = 'dev' if os.environ.get('DEBUG', 'False') == 'True' else 'prod'

if _profile == 'dev':
    from .dev import *  # noqa: F401,F403
elif _profile == 'prod':
    from .prod import *  # noqa: F401,F403
else:
    raise RuntimeError(
        f'Unknown DJANGO_SETTINGS_PROFILE={_profile!r}. '
        f"Expected 'dev' or 'prod'."
    )