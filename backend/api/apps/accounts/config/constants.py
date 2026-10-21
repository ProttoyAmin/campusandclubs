from django.conf import settings

ACCESS_COOKIE = "access"
REFRESH_COOKIE = "refresh"

# Cookie settings
COOKIE_MAX_AGE = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
REFRESH_COOKIE_MAX_AGE = settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
COOKIE_SECURE = not settings.DEBUG
COOKIE_HTTPONLY = True
COOKIE_SAMESITE = 'Lax'
COOKIE_PATH = '/'