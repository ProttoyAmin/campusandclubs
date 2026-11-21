import logging
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.http import HttpRequest

from .services.security_service import SecurityService
from .models import User, UserSession
from apps.communications.services.email.email_service import EmailService
from apps.communications.repositories.email.email_repo import EmailRepository
from .repositories.session_repo import UserSessionRepository

logger = logging.getLogger(__name__)

@receiver(user_logged_in)
def on_user_logged_in(sender, request: HttpRequest, user: User, **kwargs):
    """
    Track login attempt for security purposes (new device/IP)
    Send email alert if suspicious activity is detected
    """
    if request is None: return

    try:
        record = SecurityService(actor=user).record(request, user)

        if record.check.should_alert:
            logger.info("Security check: should_alert")
            EmailService(user, EmailRepository()).send_login_alert_email(user, subject="New Login Alert", record=record)

    except Exception:
        logger.exception("Login tracking or alert failed")

@receiver(user_logged_out)
def on_user_logged_out(sender, request: HttpRequest, user: User, **kwargs):
    if request is not None and request.session.session_key:
            UserSessionRepository.flush(request.session.session_key)