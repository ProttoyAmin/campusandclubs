from django.conf import settings
from django.db import models
from .enums import EmailRecipientType, EmailRecipientStatus

class EmailRecipient(models.Model):
    email = models.EmailField()
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="email_recipients",
    )

    recipient_type = models.CharField(
        max_length=8,
        choices=EmailRecipientType.choices,
        default=EmailRecipientType.TO,
    )

    status = models.CharField(
        max_length=32,
        choices=EmailRecipientStatus.choices,
        default=EmailRecipientStatus.PENDING,
    )
    
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    bounced_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.email} - {self.user}"