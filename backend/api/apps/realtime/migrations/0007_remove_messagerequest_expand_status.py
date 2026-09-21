"""Drop MessageRequest table (now modelled via ChatParticipant.status)
and expand ChatParticipant.status with post-membership states.

PENDING  = invite/request inbox.
ACCEPTED = active member (main inbox).
DECLINED = rejected an incoming request.
LEFT     = user voluntarily left after joining.
REMOVED  = user was kicked/banned by an admin.
BLOCKED  = user blocked the other side / the chat.
"""
from django.db import migrations, models


def forwards_map_status(apps, schema_editor):
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    # Previous migration (0006) set rows to joined/removed; collapse to the
    # correct PENDING/ACCEPTED/DECLINED set. joined → accepted, removed → declined.
    # Any legacy pending rows from 0001 already have "pending" status.
    ChatParticipant.objects.filter(status="joined").update(status="accepted")
    ChatParticipant.objects.filter(status__in=["left", "blocked", "removed"]).update(status="declined")


def backwards(apps, schema_editor):
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    ChatParticipant.objects.filter(status="accepted").update(status="joined")
    ChatParticipant.objects.filter(
        status__in=["declined", "left", "removed", "blocked"]
    ).update(status="removed")


class Migration(migrations.Migration):

    dependencies = [
        ("realtime", "0006_alter_chatparticipant_status"),
    ]

    operations = [
        migrations.RunPython(forwards_map_status, backwards),
        migrations.AlterField(
            model_name="chatparticipant",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("accepted", "Accepted"),
                    ("declined", "Declined"),
                    ("left", "Left"),
                    ("removed", "Removed"),
                    ("blocked", "Blocked"),
                ],
                default="accepted",
                max_length=10,
            ),
        ),
        migrations.DeleteModel(name="MessageRequest"),
    ]
