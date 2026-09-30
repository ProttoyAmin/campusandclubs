"""Refactor: introduce generic FormSubmission + FormAnswer, point
MembershipApplication.submission at a FormSubmission instead of directly
at a Form, and drop the application-specific MembershipApplicationResponse
table in favour of the generic FormAnswer.
"""
import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def migrate_existing_responses(apps, schema_editor):
    MembershipApplication = apps.get_model("clubs", "MembershipApplication")
    FormSubmission = apps.get_model("clubs", "FormSubmission")
    TmpAnswer = apps.get_model("clubs", "TmpFormAnswer")
    MembershipApplicationResponse = apps.get_model("clubs", "MembershipApplicationResponse")

    for app in MembershipApplication.objects.filter(form__isnull=False):
        sub = FormSubmission.objects.create(
            id=uuid.uuid4(),
            form_id=app.form_id,
            respondent_id=app.applicant_id,
        )
        TmpAnswer.objects.bulk_create(
            [
                TmpAnswer(
                    id=uuid.uuid4(),
                    submission=sub,
                    question_id=r.question_id,
                    answer=r.answer or "",
                )
                for r in MembershipApplicationResponse.objects.filter(application=app)
            ]
        )
        MembershipApplication.objects.filter(pk=app.pk).update(submission=sub)


def copy_tmp_to_final(apps, schema_editor):
    TmpAnswer = apps.get_model("clubs", "TmpFormAnswer")
    FormAnswer = apps.get_model("clubs", "FormAnswer")
    FormAnswer.objects.bulk_create(
        [
            FormAnswer(
                id=a.id,
                submission_id=a.submission_id,
                question_id=a.question_id,
                answer=a.answer,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
            for a in TmpAnswer.objects.all()
        ]
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("clubs", "0020_clubpreference_allow_public_posts_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ---- 1. New generic FormSubmission model ----
        migrations.CreateModel(
            name="FormSubmission",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "form",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="submissions",
                        to="clubs.form",
                    ),
                ),
                (
                    "respondent",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="form_submissions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-submitted_at"],
                "verbose_name": "Form Submission",
                "verbose_name_plural": "Form Submissions",
            },
        ),
        migrations.AddIndex(
            model_name="formsubmission",
            index=models.Index(
                fields=["form", "respondent"], name="clubs_formsu_form_id_b0c3e2_idx"
            ),
        ),

        # ---- 2. Add submission FK on MembershipApplication ----
        migrations.AddField(
            model_name="membershipapplication",
            name="submission",
            field=models.OneToOneField(
                blank=True,
                null=True,
                help_text="Filled-in questionnaire when the club requires one.",
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="membership_application",
                to="clubs.formsubmission",
            ),
        ),

        # ---- 3. Temporary answer table to migrate into (so we don't
        #         collide with the existing FormQuestion.answers reverse
        #         from MembershipApplicationResponse). ----
        migrations.CreateModel(
            name="TmpFormAnswer",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("answer", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "question",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="clubs.formquestion",
                    ),
                ),
                (
                    "submission",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tmp_answers",
                        to="clubs.formsubmission",
                    ),
                ),
            ],
        ),
        migrations.RunPython(migrate_existing_responses, noop),

        # ---- 4. Now safe to drop old response table and direct form FK ----
        migrations.RemoveField(
            model_name="membershipapplication",
            name="form",
        ),
        migrations.DeleteModel(
            name="MembershipApplicationResponse",
        ),

        # ---- 5. Create the real FormAnswer model (now that FormQuestion.answers
        #         reverse is free) and copy data across, drop tmp table. ----
        migrations.CreateModel(
            name="FormAnswer",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("answer", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "question",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="answers",
                        to="clubs.formquestion",
                    ),
                ),
                (
                    "submission",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="answers",
                        to="clubs.formsubmission",
                    ),
                ),
            ],
            options={
                "verbose_name": "Form Answer",
                "verbose_name_plural": "Form Answers",
            },
        ),
        migrations.AddIndex(
            model_name="formanswer",
            index=models.Index(
                fields=["submission"], name="clubs_formans_submiss_9e00b3_idx"
            ),
        ),
        migrations.AddConstraint(
            model_name="formanswer",
            constraint=models.UniqueConstraint(
                fields=("submission", "question"),
                name="unique_answer_per_question_per_submission",
            ),
        ),
        migrations.RunPython(copy_tmp_to_final, noop),
        migrations.DeleteModel(name="TmpFormAnswer"),
    ]
