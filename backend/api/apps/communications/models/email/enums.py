from django.db import models

class EmailType(models.TextChoices):
    SYSTEM = "system", "SYSTEM"
    CLUB = "club", "CLUB"
    OTHER = "other", "Other"

class EmailStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    QUEUED = "queued", "Queued"
    SENDING = "sending", "Sending"
    SENT = "sent", "Sent"
    PARTIALLY_FAILED = "partially_failed", "Partially Failed"
    FAILED = "failed", "Failed"


class EmailRecipientType(models.TextChoices):
    TO = "to", "To"
    CC = "cc", "Cc"
    BCC = "bcc", "Bcc"


class EmailRecipientStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    SENT = "sent", "Sent"
    DELIVERED = "delivered", "Delivered"
    OPENED = "opened", "Opened"
    BOUNCED = "bounced", "Bounced"
    FAILED = "failed", "Failed"

class EmailProvider(models.TextChoices):
    RESEND = "resend", "Resend"
    SMTP = "smtp", "SMTP"
    OTHER = "other", "Other"