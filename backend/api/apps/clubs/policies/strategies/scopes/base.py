# clubs/strategies/scopes/base.py

from abc import ABC, abstractmethod
from apps.accounts.models import User
from apps.clubs.models import Club
from apps.clubs.dtos.decisions import Decision

class MembershipScopeStrategy(ABC):

    @abstractmethod
    def evaluate(
        self,
        actor: User,
        club: Club,
    ) -> Decision:
        ...