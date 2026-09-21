from django.db import models
from django.conf import settings

from apps.accounts.models.enums import PostVisibility
from .enums import MessageRequestChoice


class UserPreference(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    
    show_in_search = models.BooleanField(default=True)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    default_post_visibility = models.CharField(
        max_length=20, choices=PostVisibility.choices, default=PostVisibility.PUBLIC
    )

    message_request_choice = models.CharField(
        max_length=20,
        choices=MessageRequestChoice.choices,
        default=MessageRequestChoice.EVERYONE,
    )

    class Meta:
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
        db_table = 'user_preferences'
        

    def __str__(self) -> str:
        return f"{self.user.username} preferences"
