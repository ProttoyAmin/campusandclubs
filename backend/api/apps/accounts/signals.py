"""Accounts app signals — ensure a UserPreference row exists for every user."""
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_preference(sender, instance, created, **kwargs):
    if created:
        from apps.accounts.models.user_preference import UserPreference
        UserPreference.objects.get_or_create(user=instance)
