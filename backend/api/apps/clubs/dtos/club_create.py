# apps/clubs/dtos.py
from dataclasses import dataclass
from typing import Optional
import uuid
from django.core.files.uploadedfile import UploadedFile

from apps.institutes.models import Institute
from apps.clubs.models.club.department_templates import DepartmentTemplate
from apps.clubs.models import JoinMode, Visibility, MembershipScope


@dataclass(frozen=True)
class ClubDuplicateCheckDTO:
    name: str
    origin: Optional[Institute]
    exclude_pk: Optional[uuid.UUID] = None


@dataclass(frozen=True)
class ClubCreateDTO:
    name: str
    about: str
    privacy: Visibility
    scope: MembershipScope
    join_mode: JoinMode
    origin: Optional[Institute]
    departments: list[DepartmentTemplate]
    avatar: Optional[UploadedFile]
    banner: Optional[UploadedFile]
