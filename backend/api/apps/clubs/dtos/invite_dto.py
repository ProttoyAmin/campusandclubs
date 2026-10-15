from apps.clubs.models import Invite
from apps.clubs.models.enums import InviteStatus
import datetime
from apps.clubs.models.event import Event
from apps.accounts.models import User
from apps.clubs.models import Club
from dataclasses import dataclass
from typing import TypedDict, Literal

class InviteAttrs(TypedDict):
    invite_type: Literal['club', 'event']
    club_id: str
    event_id: str | None
    message: str | None

@dataclass(frozen=True)
class InviteDTO:
    invite_type: Literal['club', 'event']
    club: Club
    event: Event | None
    message: str | None
    created_by: User
    expires_at: datetime.datetime | None
    status: InviteStatus
    code: str

@dataclass(frozen=True)
class InviteUsageDTO:
    invite: Invite
    user: User
    ip_address: str
    user_agent: str
    used_at: datetime.datetime