
from dataclasses import dataclass
import uuid


@dataclass(frozen=True)
class AffiliateCreateDTO:
    institute_id: uuid.UUID
    user_id: uuid.UUID
    email: str
    role: str
