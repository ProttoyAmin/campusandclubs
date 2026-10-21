from django.conf import settings
from django.db import models
from apps.clubs.models import Club
from .enums import EmailStatus
from .recipient import EmailRecipient
from .enums import EmailStatus, EmailProvider, EmailType

class Email(models.Model):
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True, related_name="emails")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_emails",
    )
    recipients = models.ManyToManyField(EmailRecipient, related_name="emails")
    cc_recipients = models.ManyToManyField(EmailRecipient, related_name="cc_emails", blank=True)
    bcc_recipients = models.ManyToManyField(EmailRecipient, related_name="bcc_emails", blank=True)

    type = models.CharField(max_length=32, choices=EmailType.choices, default=EmailType.CLUB)
    
    subject = models.CharField(max_length=255, blank=True, default="")
    body = models.TextField()
    
    attachments = models.ManyToManyField("media.Media", related_name="emails", blank=True)

    status = models.CharField(max_length=32, choices=EmailStatus.choices, default=EmailStatus.PENDING)

    provider = models.CharField(
        max_length=32,
        choices=EmailProvider.choices,
        null=True,
        blank=True,
    )

    provider_message_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )

    provider_metadata = models.JSONField(
        default=dict,
        blank=True,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.club} - {self.id}"

