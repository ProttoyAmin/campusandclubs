
from dataclasses import dataclass
import uuid
from allauth.account.models import EmailAddress


@dataclass(frozen=True)
class AffiliateCreateDTO:
    institute_id: uuid.UUID
    user_id: uuid.UUID
    email: EmailAddress
    role: str
