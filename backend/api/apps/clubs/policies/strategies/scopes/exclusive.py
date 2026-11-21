# clubs/strategies/scopes/exclusive.py
from .base import MembershipScopeStrategy
from apps.clubs.dtos.decisions import Decision
from apps.accounts.models import User
from apps.clubs.models import Club

class ExclusiveScopeStrategy(MembershipScopeStrategy):

    def evaluate(self, actor: User, club: Club) -> Decision:

        if actor.affiliations.filter(institute=club.origin).exists() == club.origin:
            return Decision(True, "")

        return Decision(
            False,
            "This club is exclusive to members of a specific institute."
        )