from __future__ import annotations

from typing import Iterable, Tuple, Union

from django.db import transaction
from django.db.models import Model, QuerySet

from apps.accounts.models import User
from apps.clubs.models import Form, FormAnswer, FormQuestion, FormSubmission
from core.repositories import BaseRepository


AnswerTuple = Tuple[Union[FormQuestion, str], str]


class FormSubmissionRepository(BaseRepository[FormSubmission]):
    model = FormSubmission

    def get_queryset(self) -> QuerySet[FormSubmission]:
        return super().get_queryset().select_related("form", "respondent")

    # ------------------------------------------------------------------ #
    # Submission creation with atomic answer persistence
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def submit(
        self,
        *,
        form: Form,
        respondent: User,
        answers: Iterable[AnswerTuple],
    ) -> FormSubmission:
        """Create a FormSubmission + its FormAnswer rows atomically.

        ``answers`` is an iterable of (question_or_id, answer_text). Caller
        is expected to have validated the question set; this method does
        NOT enforce required-question rules — that's the service layer.
        """
        submission = self.create(form=form, respondent=respondent)
        answer_objs: list[FormAnswer] = []
        for question, answer_text in answers:
            qid = question.id if hasattr(question, "id") else question
            answer_objs.append(
                FormAnswer(
                    submission=submission,
                    question_id=str(qid),
                    answer=(answer_text or ""),
                )
            )
        FormAnswer.objects.bulk_create(answer_objs)
        return submission
