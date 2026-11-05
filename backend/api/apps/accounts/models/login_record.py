from django.db import models
from django.conf import settings



class LoginRecord(models.Model):

    class DeviceType(models.TextChoices):
        DESKTOP = "desktop", "Desktop"
        MOBILE = "mobile", "Mobile"
        TABLET = "tablet", "Tablet"
        BOT = "bot", "Bot"
        OTHER = "other", "Other"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='login_records')
    
    # Device identification

    device_hash = models.CharField(max_length=64)
    
    # Network Identification
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Original user-agent
    user_agent = models.CharField(max_length=512, blank=True)

    # Parsed browser information
    browser = models.CharField(
        max_length=64,
        blank=True,
        default=""
    )
    browser_version = models.CharField(
        max_length=32,
        blank=True,
        default=""
    )

    # Parsed operaing system information
    os = models.CharField(
        max_length=64,
        blank=True,
        default=""
    )
    os_version = models.CharField(
        max_length=32,
        blank=True,
        default=""
    )

    # Parsed device information
    device_family = models.CharField(
        max_length=64,
        blank=True,
        default=""
    )
    device_type = models.CharField(
        max_length=10,
        choices=DeviceType.choices,
        default=DeviceType.OTHER
    )
    device_brand = models.CharField(
        max_length=64,
        blank=True,
        default=""
    )
    device_model = models.CharField(
        max_length=64,
        blank=True,
        default=""
    )


    is_bot = models.BooleanField(default=False)
    is_touch_capable = models.BooleanField(default=False)
    is_email_client = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        db_table = "login_records"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "device_hash"]),
            models.Index(fields=["user", "ip_address"]),
        ]

    def __str__(self) -> str:
        return f"{self.user} - {self.browser} - {self.created_at}"