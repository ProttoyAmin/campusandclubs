from django.core.cache import cache


USER_PROFILE_KEY = "user:profile:version"

def get_user_profile_version() -> int:
    version = cache.get(USER_PROFILE_KEY)
    if version is None:
        version = 1
        cache.set(USER_PROFILE_KEY, version, timeout=None)
    return version