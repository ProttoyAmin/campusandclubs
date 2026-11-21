# clubs/strategies/scopes/open.py
from .base import MembershipScopeStrategy
from apps.clubs.dtos.decisions import Decision
from apps.accounts.models import User
from apps.clubs.models import Club

class OpenScopeStrategy(MembershipScopeStrategy):

    def evaluate(self, actor: User, club: Club) -> Decision:
        return Decision(True, "")