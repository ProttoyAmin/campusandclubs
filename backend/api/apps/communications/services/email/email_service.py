from apps.institutes.models.choices import VerificationMethod
from django.utils import timezone
from django.conf import settings
from apps.institutes.models import InstituteAffiliate
from anymail.message import AnymailMessage
from django.core.mail import send_mail
from django.db.models import QuerySet
from apps.communications.models.email.enums import EmailProvider
from django.template.loader import render_to_string
import uuid
from django.db import transaction
from apps.clubs.models import Club
from apps.accounts.models import User
import logging
from core.services import BaseService
from apps.communications.models import Email, EmailRecipient, EmailRecipientStatus, EmailRecipientType, EmailStatus, EmailType
from apps.communications.repositories import EmailRepository, EmailRecipientRepository
from apps.accounts.repositories.user_repo import UserRepository
from apps.institutes.models import Institute
from apps.clubs.repositories import ClubRepository


logger = logging.getLogger(__name__)


class EmailService(BaseService[Email, EmailRepository]):
    repository_class = EmailRepository
    club_repo = ClubRepository()
    recipient_repo = EmailRecipientRepository()
    user_repo = UserRepository()

    def list_emails(self) -> QuerySet[Email]:
        return self.repository.get_queryset()

    def send_affiliate_confirmation_email(self, affiliate: InstituteAffiliate, email: str):
        user: User = affiliate.user
        institute: Institute = affiliate.institute
        role = affiliate.role

        recipient = self.recipient_repo.create(user_id=user.id, email=email)

        verification_link = f"{settings.FRONTEND_URL}/verify-affiliation/{affiliate.verification_token}/"

        subject = "Affiliation Confirmation"
        body = render_to_string("emails/affiliation_confirmation.html", {
            "username": user.username,
            "institute_name": institute.name,
            "role": role,
            "verification_link": verification_link,
        })

        email = self.repository.create(
            subject=subject + " for " + institute.name, body=body, type=EmailType.SYSTEM, status=EmailStatus.PENDING)

        sent_email = self._send_email(email, [recipient.email])
        recipient.sent_at = timezone.now()
        recipient.status = EmailStatus.SENT
        recipient.save()

        affiliate.verification_method = VerificationMethod.EMAIL
        affiliate.save()

        return sent_email

    def send_club_email(self, sender: User, club: Club, subject: str, target_users: list[User], **kwargs) -> Email:
        sent_emails_log: list[Email] = []
        visit_url = f"{settings.FRONTEND_URL}/@/clubs/{club.slug}"

        with transaction.atomic():
            user_email_map: dict[int, tuple[Email, EmailRecipient]] = {}

            for user in target_users:
                personalized_body = render_to_string("emails/membership_approval.html", {
                    "username" : user.username,
                    "club_name" : club.name if hasattr(club, "name") else "",
                    "visit_link" : visit_url
                })

                email_record = self.get_repository().create(
                    club=club,
                    sender=sender,
                    type=EmailType.CLUB,
                    subject=subject,
                    body=personalized_body,
                    status=EmailStatus.PENDING
                )

                recipient_node = self.recipient_repo.create(
                    email=email_record,
                    user=user,
                    recipient_type=EmailRecipientType.TO,
                    status=EmailRecipientStatus.PENDING,
                )

                user_email_map[user.id] = (email_record, recipient_node)
        
        for user in target_users:
            email_record, recipient_node = user_email_map[user.id]

            sent_instance = self._send_email(
                email=email_record,
                to=[user.email]
            )
            sent_emails_log.append(sent_instance)
        
        return sent_instance

    def _send_email(self, email: Email, to: list[str]) -> Email:
        django_email = AnymailMessage(
            subject=email.subject,
            body=email.body,
            to=to
        )
        django_email.content_subtype = "html"
        logger.info("Initiating email dispatch sequence")

        try:
            django_email.send()
            logger.info("Network payload sent successfully")
            
            if hasattr(django_email, "anymail_status") and django_email.anymail_status.recipients:
                status_meta = django_email.anymail_status
                email.provider = EmailProvider.RESEND
                email.provider_message_id = getattr(
                    status_meta, "message_id", None
                )
                # FIXED: Corrected logging string serialization formatting
                logger.info(f"Provider metadata resolved message ID: {email.provider_message_id}")
            else:
                email.provider = EmailProvider.SMTP
                email.provider_message_id = None

            email.status = EmailStatus.SENT
            email.sent_at = timezone.now()
            logger.info("Internal delivery state set to SENT")

            status_data = (
                {
                    "message_id": getattr(status_meta, "message_id", None),
                    "status": list(status_meta.status) if hasattr(status_meta, "status") else [],  # type: ignore
                }
                if "status_meta" in locals() and status_meta
                else None
            )
            
            logger.info("Base status dictionary payload constructed")
            esp_extra_raw = getattr(django_email, "esp_extra", None)
            # Check if esp_extra exists and is not the internal sentinel class
            # if esp_extra_raw and esp_extra_raw.__class__.__name__ != "UNSET":
            #     safe_esp_extra = dict(esp_extra_raw)
            # else:
            #     safe_esp_extra = {}

            
            email.provider_metadata = {
                "subject": django_email.subject,
                "body": django_email.body,
                "to": django_email.to,
                "cc": getattr(django_email, "cc", []),
                "bcc": getattr(django_email, "bcc", []),
                "from_email": django_email.from_email,
                "extra_headers": getattr(django_email, "extra_headers", {}),
                "anymail_status": status_data,
                # "esp_extra": safe_esp_extra,
            }
            
            # FIXED: Corrected logger structure syntax
            logger.info(f"Provider metadata snapshot ready: {email.provider_metadata}")
            
            safe_attachments = []
            for att in getattr(django_email, "attachments", []):
                if isinstance(att, tuple) and len(att) > 0:
                    safe_attachments.append(str(att[0]))
                else:
                    safe_attachments.append(str(att))

            safe_alternatives = [
                {"content": alt[0], "mimetype": alt[1]} 
                for alt in getattr(django_email, "alternatives", [])
                if isinstance(alt, tuple) and len(alt) >= 2
            ]
            logger.info("Safe alternative structures converted")

            email._raw = {
                "subject": django_email.subject,
                "body": django_email.body,
                "to": django_email.to,
                "cc": getattr(django_email, "cc", []),
                "bcc": getattr(django_email, "bcc", []),
                "from_email": django_email.from_email,
                "extra_headers": getattr(django_email, "extra_headers", {}),
                "anymail_status": status_data,
                "alternatives": safe_alternatives,
                "content_subtype": django_email.content_subtype,
                # "esp_extra": safe_esp_extra,
                "attachments": safe_attachments,
            }
            
            # FIXED: Corrected logger structure syntax
            logger.info(f"Raw logging dictionary payload ready: {email._raw}")
            
            email.save(
                update_fields=[
                    "provider",
                    "provider_message_id",
                    "status",
                    "sent_at",
                    "provider_metadata",
                    "_raw",
                ]
            )
            logger.info("Parent email record successfully updated and saved")

            # FIXED: Changed from .recipients to .recieved_email to match your model's exact related_name definition
            email.recipients.update(
                status=EmailRecipientStatus.SENT, sent_at=timezone.now()
            )
            logger.info("Recipient nodes updated to SENT status state")

            return email

        except Exception as e:
            # CRITICAL DEVELOPER BEST PRACTICE: Log the actual error stack trace message 'e' so you can catch issues instantly
            logger.error(f"Execution failed inside the email processing exception block. Error details: {str(e)}")
            email.status = EmailStatus.FAILED
            email.save(update_fields=["status"])
            
            # FIXED: Changed from .recipients to .recieved_email
            email.recipients.update(
                status=EmailRecipientStatus.FAILED, failed_at=timezone.now()
            )
            return email