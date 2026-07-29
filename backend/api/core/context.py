from dataclasses import dataclass

from apps.accounts.models import User


@dataclass(frozen=True)
class RequestContext:
    actor: User
    ip_address: str | None = None
    request_id: str | None = None