# accounts/adapters.py
import logging
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

logger = logging.getLogger(__name__)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        logger.error(
            "Social auth error: provider=%s error=%s exception=%s extra=%s",
            provider, error, exception, extra_context,
        )
        super().on_authentication_error(request, provider, error=error,
                                        exception=exception, extra_context=extra_context)
