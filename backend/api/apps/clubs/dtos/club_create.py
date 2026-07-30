# apps/clubs/dtos.py
from dataclasses import dataclass
from typing import Optional
import uuid

from apps.institutes.models import Institute


@dataclass(frozen=True)
class ClubDuplicateCheckDTO:
    name: str
    origin: Optional[Institute]
    exclude_pk: Optional[uuid.UUID] = None