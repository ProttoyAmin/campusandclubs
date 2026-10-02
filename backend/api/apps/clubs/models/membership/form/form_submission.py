import uuid
from django.db import models
from django.conf import settings

class FormSubmission(models.Model):
    """One user's submission to any Form.

    Generic in the same sense that Form is: any domain model (e.g.
    MembershipApplication, PollResponse, EventRsvp) can point at a
    FormSubmission via a OneToOne to attach a filled-in questionnaire
    to its record. This keeps answers reusable across features while
    letting the domain model own its own lifecycle (status, reviewed_by,
    etc.).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        "clubs.Form", on_delete=models.CASCADE, related_name="submissions"
    )
    respondent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="form_submissions",
    )

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-submitted_at"]
        indexes = [models.Index(fields=["form", "respondent"])]
        verbose_name = "Form Submission"
        verbose_name_plural = "Form Submissions"

    def __str__(self) -> str:
        return f"submission {self.id} on form {self.form_id} by {self.respondent_id}"