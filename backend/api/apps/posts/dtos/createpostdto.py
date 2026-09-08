from apps.clubs.models import Club
from dataclasses import dataclass
from django.core.files.base import File
from typing import TypedDict

class PostCreateAttrs(TypedDict, total=False):
    content: str | None
    media: File | None
    clubs: Club | None