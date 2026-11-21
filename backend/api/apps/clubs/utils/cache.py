# somewhere in your services or a utils/cache.py
from django.core.cache import cache

CLUBS_LIST_VERSION_KEY = "clubs:list:version"

def get_clubs_list_version() -> int:
    version = cache.get(CLUBS_LIST_VERSION_KEY)
    if version is None:
        version = 1
        cache.set(CLUBS_LIST_VERSION_KEY, version, timeout=None)  # never expires
    return version

def bump_clubs_list_version():
    """Call this whenever clubs list data can change."""
    try:
        cache.incr(CLUBS_LIST_VERSION_KEY)
    except ValueError:
        # key didn't exist
        cache.set(CLUBS_LIST_VERSION_KEY, 2, timeout=None)