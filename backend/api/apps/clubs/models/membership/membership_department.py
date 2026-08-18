# apps/clubs/models/membership_department.py
import uuid
from django.db import models


class MembershipDepartment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    membership = models.ForeignKey(
        "clubs.Membership", on_delete=models.CASCADE, related_name="department_memberships"
    )
    department = models.ForeignKey(
        "clubs.ClubDepartment", on_delete=models.CASCADE, related_name="member_links"
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "membership_departments"
        constraints = [
            models.UniqueConstraint(
                fields=["membership", "department"], name="unique_member_department"
            )
        ]