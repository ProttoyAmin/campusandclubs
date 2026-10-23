from django.apps import AppConfig
from django.db.models.signals import post_migrate


def sync_permissions(sender, **kwargs):
    from apps.clubs.models import ClubPermission
    from apps.clubs.models.permission import PermissionCodename

    for choice in PermissionCodename:
        ClubPermission.objects.update_or_create(
            codename=choice.value,
            defaults={"name": choice.label},
        )


class ClubsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.clubs'

    def ready(self):
        post_migrate.connect(sync_permissions, sender=self)
