from apps.communications.models import Email
from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.communications.models import EmailRecipient

class EmailRecipientRepository(BaseRepository[EmailRecipient]):
    model = EmailRecipient

    def add_to_email(self, email: Email, recipient: EmailRecipient):
        email.recipients.add(recipient)

    def add_to_emails(self, email: Email, recipients: list[EmailRecipient]):
        email.recipients.add(*recipients)
