# accounts/adapters.py
import logging
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

logger = logging.getLogger(__name__)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        extra_data = sociallogin.account.extra_data or {}
        picture = extra_data.get("picture") or data.get("picture")
        if picture and not getattr(user, "avatar", None):
            user.avatar = picture
        user.email_verified = True
        return user

    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        logger.error(
            "Social auth error: provider=%s error=%s exception=%s extra=%s",
            provider, error, exception, extra_context,
        )
        super().on_authentication_error(request, provider, error=error,
                                        exception=exception, extra_context=extra_context)
