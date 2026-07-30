
from dataclasses import dataclass
import uuid


@dataclass(frozen=True)
class AffiliateCreateDTO:
    institute_id: uuid.UUID
    user_id: uuid.UUID
    role: str