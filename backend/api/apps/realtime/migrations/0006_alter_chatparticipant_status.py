"""Migrate ChatParticipant.status from accepted/pending/declined semantics
to joined/left/blocked/removed. Pending/declined state now lives only on
MessageRequest; existing PENDING/DECLINED participant rows are stale and
mapped to ``removed``.
"""
from django.db import migrations, models


def forwards(apps, schema_editor):
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    ChatParticipant.objects.filter(status="accepted").update(status="joined")
    ChatParticipant.objects.filter(status="pending").update(status="removed")
    ChatParticipant.objects.filter(status="declined").update(status="removed")


def backwards(apps, schema_editor):
    ChatParticipant = apps.get_model("realtime", "ChatParticipant")
    ChatParticipant.objects.filter(status="joined").update(status="accepted")
    ChatParticipant.objects.filter(status__in=["removed", "left", "blocked"]).update(status="declined")


class Migration(migrations.Migration):

    dependencies = [
        ("realtime", "0005_messagerequest_chat"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
        migrations.AlterField(
            model_name="chatparticipant",
            name="status",
            field=models.CharField(
                choices=[
                    ("joined", "Joined"),
                    ("left", "Left"),
                    ("blocked", "Blocked"),
                    ("removed", "Removed"),
                ],
                default="joined",
                max_length=10,
            ),
        ),
    ]
