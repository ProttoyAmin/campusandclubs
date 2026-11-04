import logging
from celery import shared_task
from django.contrib.auth import get_user_model


User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),  # Catches API connection dropouts/timeouts
    max_retries=3,               # Total retry attempts before giving up
    default_retry_delay=60,      # Wait 60 seconds between retries
)
def send_individual_approval_email(
    self,
    sender_id: str,
    club_id: str,
    user_id: str,
    subject: str
): ...
    # TODO: Implement background job for sending bulk emails