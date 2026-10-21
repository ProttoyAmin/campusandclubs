from typing import Iterable
from django.db import transaction
from apps.clubs.models import FormQuestion
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

    # ------------------------------------------------------------------ #
    # Mutations
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def create_form_for(
        self,
        *,
        target: Model,
        title: str,
        created_by,
        questions: Iterable[dict],
        is_active: bool = True,
    ) -> Form:
        """Create a Form owned by ``target`` (any model) with its questions
        in one atomic block. Deactivates any previously-active form on the
        same owner so the unique_active_form_per_owner constraint holds.
        """
        content_type = ContentType.objects.get_for_model(target)
        object_id = str(target.pk)

        # Soft-deactivate other active forms for this owner to avoid collision.
        self.get_queryset().filter(
            content_type=content_type, object_id=object_id, is_active=True
        ).exclude(deleted_at__isnull=False).update(is_active=False)

        form = self.create(
            content_type=content_type,
            object_id=object_id,
            title=title,
            is_active=is_active,
            created_by=created_by,
        )
        q_objs = [
            FormQuestion(
                form=form,
                question=q["question"],
                type=q["type"],
                required=bool(q.get("required", False)),
                order=int(q.get("order", i)),
            )
            for i, q in enumerate(questions)
        ]
        FormQuestion.objects.bulk_create(q_objs)
        return form