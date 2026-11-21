# clubs/strategies/scopes/intra.py
from .base import MembershipScopeStrategy
from apps.clubs.dtos.decisions import Decision
from apps.accounts.models import User
from apps.clubs.models import Club

class IntraScopeStrategy(MembershipScopeStrategy):

    def evaluate(self, actor: User, club: Club) -> Decision:

        if actor.affiliations.exists():
            return Decision(True, "")

        return Decision(
            False,
            "This club requires a verified institute affiliation."
        )