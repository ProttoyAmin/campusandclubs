import uuid
from django.utils import timezone
from django.conf import settings
from django.db import models


class UserSession(models.Model):
    class Kind(models.TextChoices):
        WEB = "web", "Web (session cookie)"
        APP = "app", "App (JWT refresh token)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="login_sessions")
    
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.WEB)
    session_key = models.CharField(max_length=40, unique=True, null=True, blank=True)
    refresh_jti = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    device_hash = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=512, blank=True)
    
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "user_sessions"
        ordering = ["-last_seen_at"]
        indexes = [models.Index(fields=["user", "-last_seen_at"])]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(kind="web", session_key__isnull=False, refresh_jti__isnull=True)
                    | models.Q(kind="app", refresh_jti__isnull=False, session_key__isnull=True)
                ),
                name="user_session_exactly_one_credential",
            )
        ]

    def __str__(self) -> str:
        return f"{self.user.username} on {self.browser} with {self.os}"