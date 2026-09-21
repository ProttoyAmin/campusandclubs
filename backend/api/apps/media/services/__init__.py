from django.conf import settings
from cloudinary.uploader import upload as cloudinary_upload
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from mimetypes import guess_type

from apps.media.models import Media, MediaRole
from apps.media.repositories import MediaRepository


def detect_attachment_kind(mime_type: str | None, file_name: str | None) -> str:
    """Map a MIME type to a MessageAttachmentKind value."""
    from apps.realtime.models.chat.message import MessageAttachmentKind
    if not mime_type:
        mime_type, _ = guess_type(file_name or "")
    if mime_type:
        primary = mime_type.split("/", 1)[0]
        if primary == "image":
            return MessageAttachmentKind.IMAGE
        if primary == "video":
            return MessageAttachmentKind.VIDEO
        if primary == "audio":
            return MessageAttachmentKind.AUDIO
    return MessageAttachmentKind.FILE


def build_attachment_from_media(media: Media):
    """Convert a persisted ``Media`` row to the wire dict expected by
    ``MessageAttachmentSerializer`` / the frontend."""
    secure_url = media.file.source(secure=True) if hasattr(media.file, "source") else media.file.url
    kind = detect_attachment_kind(getattr(media.file, "resource_type", None) and f"{media.file.resource_type}/*", media.original_file_name)
    # Cloudinary stores images as resource_type="image", video as "video",
    # raw as "raw" (which we treat as file). Audio is reported as "video"
    # by Cloudinary by default; refine via mime_type.
    ct = media.file.format
    resource_type = getattr(media.file, "resource_type", "raw")
    if resource_type == "image":
        kind = "image"
    elif resource_type == "video":
        # crude audio detection
        if media.original_file_name and media.original_file_name.lower().endswith(
            (".mp3", ".wav", ".m4a", ".ogg", ".aac", ".flac", ".opus")
        ):
            kind = "audio"
        else:
            kind = "video"
    else:
        kind = "file"
    return {
        "file_url": media.file.url,
        "thumb_url": secure_url if kind == "image" else None,
        "kind": kind,
        "file_name": media.original_file_name or None,
        "mime_type": guess_type(media.original_file_name or "")[0] if media.original_file_name else None,
        "size_bytes": None,
        "width": None,
        "height": None,
        "duration_ms": None,
        "media_id": str(media.id),
    }


__all__ = [
    "MediaRepository",
    "MediaRole",
    "Media",
    "build_attachment_from_media",
    "detect_attachment_kind",
]
