from django.db import models


class ChatType(models.TextChoices):
    DIRECT = "DIRECT", "Direct"
    GROUP = "GROUP", "Group"
    CLUB = "CLUB", "Club"