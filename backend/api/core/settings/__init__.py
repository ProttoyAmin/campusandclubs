"""
core.settings package.

DJANGO_SETTINGS_MODULE stays "core.settings" — nothing about how you invoke
manage.py / daphne / gunicorn needs to change. This file just reads DEBUG
(from .env.local) and imports dev.py or prod.py for the rest.
"""

from os import getenv, path
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

_env_file = BASE_DIR / ".env.local"
if path.isfile(_env_file):
    load_dotenv(_env_file)

DEBUG = getenv("DEBUG", "False") == "True"

if DEBUG:
    from .dev import *  # noqa: F401,F403
else:
    from .prod import *  # noqa: F401,F403
