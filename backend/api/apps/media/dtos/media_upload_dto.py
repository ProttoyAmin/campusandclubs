from apps.media.models import MediaRole
from django.core.files.uploadedfile import UploadedFile
from uuid import UUID
from apps.clubs.models import Club
from dataclasses import dataclass
from django.core.files.base import File
from typing import TypedDict


class MediaUploadAttrs(TypedDict):
    target_type: str
    object_id: str
    role: MediaRole
    file: UploadedFile
    # position: int

@dataclass
class MediaUploaDTO:
    target_type: str
    object_id: UUID
    role: MediaRole
    file: UploadedFile
    # position: int