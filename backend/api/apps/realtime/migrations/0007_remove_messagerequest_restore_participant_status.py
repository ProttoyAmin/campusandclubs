"""Drop MessageRequest table (now modelled via ChatParticipant.status)
and restore ChatParticipant.status to pending/accepted/declined.

PENDING on ChatParticipant is the single source of truth for the
"message requests" inbox; there is no separate MessageRequest model.
"""
from django.db import migrations, models


def forwards_map_status(apps, schema_editor):
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    # joined -> accepted; anything non-accepted (left/blocked/removed/pending)
    # stays as-is if already pending, else declined.
    ChatParticipant.objects.filter(status="joined").update(status="accepted")
    ChatParticipant.objects.filter(status__in=["left", "blocked", "removed"]).update(status="declined")


def backwards(apps, schema_editor):
    # We don't bother restoring MessageRequest rows on reverse.
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    ChatParticipant.objects.filter(status="accepted").update(status="joined")
    ChatParticipant.objects.filter(status="declined").update(status="removed")


class Migration(migrations.Migration):

    dependencies = [
        ("realtime", "0006_alter_chatparticipant_status"),
    ]

    operations = [
        # 1. Soft-remap data first (rows with 'joined'/'left'/'blocked'/'removed'
        #    would otherwise fail the new choice validation).
        migrations.RunPython(forwards_map_status, backwards),
        # 2. Tighten choices back to pending/accepted/declined.
        migrations.AlterField(
            model_name="chatparticipant",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("accepted", "Accepted"),
                    ("declined", "Declined"),
                ],
                default="accepted",
                max_length=10,
            ),
        ),
        # 3. Drop the MessageRequest model (no longer used).
        migrations.DeleteModel(name="MessageRequest"),
    ]
