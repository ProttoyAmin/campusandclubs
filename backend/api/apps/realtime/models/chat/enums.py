from django.db import models


class ChatType(models.TextChoices):
    DIRECT = "DIRECT", "Direct"
    GROUP = "GROUP", "Group"
    CLUB = "CLUB", "Club"

class MessageType(models.TextChoices):
    """All supported message kinds. Defaults to plain text so existing
    clients that don't send this field continue to work."""

    TEXT = "TEXT", "Text"
    IMAGE = "IMAGE", "Image"
    VIDEO = "VIDEO", "Video"
    FILE = "FILE", "File"
    VOICE = "VOICE", "Voice"
    STICKER = "STICKER", "Sticker"
    SYSTEM = "SYSTEM", "System event"
    LOCATION = "LOCATION", "Location"


class MessageDeleteMode(models.TextChoices):
    """Describes how a deleted message should be treated."""

    NONE = "NONE", "Not deleted"
    FOR_ME = "FOR_ME", "Deleted for me"
    FOR_EVERYONE = "FOR_EVERYONE", "Deleted for everyone"

class MessageAttachmentKind(models.TextChoices):
    IMAGE = "image", "Image"
    VIDEO = "video", "Video"
    AUDIO = "audio", "Audio"
    FILE = "file", "File"