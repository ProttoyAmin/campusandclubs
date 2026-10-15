from datetime import timedelta
from django.utils import timezone

def default_invite_expires_at(days = 1):
    return timezone.now() + timedelta(days=days)