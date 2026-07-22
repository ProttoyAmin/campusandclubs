import uuid
from django.contrib.contenttypes.models import ContentType
from django.db.models import Model, QuerySet
from core.repositories import BaseRepository
from apps.clubs.models import Form


class FormRepository(BaseRepository[Form]):
    model = Form

    def get_queryset(self) -> QuerySet[Form]:
        return super().get_queryset()

    def has_form(self, target: Model) -> bool:
        return self.exists(
            content_type=ContentType.objects.get_for_model(target),
            object_id=str(target.pk),
        )

    def get_active_form(self, target: Model) -> Form | None:
        return self.get_queryset().filter(
            content_type=ContentType.objects.get_for_model(target),
            object_id=str(target.pk),
            is_active=True,
        ).first()

    def get_forms(self, target: Model) -> QuerySet[Form]:
        return self.get_queryset().filter(
            content_type=ContentType.objects.get_for_model(target),
            object_id=str(target.pk),
        )