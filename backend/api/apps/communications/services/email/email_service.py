from anymail.message import AnymailMessage
from django.db.models import QuerySet
from apps.communications.models.email.enums import EmailProvider
import uuid
from apps.clubs.models import Club
from apps.accounts.models import User
import logging
from core.services import BaseService
from apps.communications.models import Email, EmailStatus, EmailType
from apps.communications.repositories import EmailRepository, EmailRecipientRepository
from apps.accounts.repositories.user_repo import UserRepository

from apps.clubs.repositories import ClubRepository


logger = logging.getLogger(__name__)


class EmailService(BaseService[Email, EmailRepository]):
    repository_class = EmailRepository
    club_repo = ClubRepository()
    recipient_repo = EmailRecipientRepository()
    user_repo = UserRepository()

    def list_emails(self) -> QuerySet[Email]:
        return self.repository.get_queryset()
    

    def send_club_email(self, sender: User, receiver: str, club_id: uuid.UUID,  body: str, **kwargs):
        club = self.club_repo.get_queryset().filter(pk=club_id).first()
        recipient = self.recipient_repo.get_queryset().filter(email=receiver).first()

        if club.owner.id != sender.id:
            raise ValueError("You are not the owner of this club")

        if not club:
            raise ValueError("Club not found")
        
        if not recipient:
            raise ValueError("User not found")
        
        email = self.repository.create(sender=sender, club=club, body=body, type=EmailType.CLUB, status=EmailStatus.PENDING)
        self.recipient_repo.add_to_email(email, recipient=recipient)

        return self.send_resend_email(email, recipient.email)

    # TODO: Fix this shit
    # UPDATE: FIXED! But needs polishing
    def send_resend_email(self, email: Email, receiver: str):
        django_email = AnymailMessage(
            subject=email.subject,
            body=email.body,
            to=[receiver]
        )

        try:
            django_email.send()
            status = django_email.anymail_status

            email.provider = EmailProvider.RESEND
            email.provider_message_id = status.message_id
            email.status = EmailStatus.SENT

            email.save(
                update_fields=[
                    "provider",
                    "provider_message_id",
                    "status",
                    "sent_at",
                ]
            )

            return email

        except Exception:
            email.status = EmailStatus.FAILED
            email.save(update_fields=["status"])
            raise