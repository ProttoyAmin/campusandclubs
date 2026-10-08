# apps/clubs/dtos.py
from apps.clubs.models import ClubStatus
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

    @classmethod
    def from_validated_data(cls, data: dict) -> "ClubCreateDTO":
        return cls(
            name=data["name"],
            about=data.get("about", ""),
            privacy=data["privacy"],
            scope=data["scope"],
            join_mode=data["join_mode"],
            origin=data.get("origin"),
            departments=data.get("department_templates", []),
            avatar=data.get("avatar"),
            banner=data.get("banner"),
        )


@dataclass(frozen=True)
class ClubUpdateSettingsDTO:
    privacy: Visibility
    join_mode: JoinMode
    scope: MembershipScope
    status: ClubStatus

    @classmethod
    def from_validated_data(cls, data: dict) -> "ClubUpdateSettingsDTO":
        return cls(
            privacy=data["privacy"],
            join_mode=data["join_mode"],
            scope=data["scope"],
            status=data["status"],
        )

@dataclass(frozen=True)
class ClubPrivacyJoinModeDTO:
    privacy: Visibility
    join_mode: JoinMode