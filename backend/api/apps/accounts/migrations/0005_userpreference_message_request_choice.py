from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_alter_user_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpreference',
            name='message_request_choice',
            field=models.CharField(
                choices=[
                    ('everyone', 'Everyone'),
                    ('followers', 'People who follow you'),
                    ('mutual', 'People you follow back'),
                    ('none', 'No one'),
                ],
                default='everyone',
                max_length=20,
            ),
        ),
    ]
