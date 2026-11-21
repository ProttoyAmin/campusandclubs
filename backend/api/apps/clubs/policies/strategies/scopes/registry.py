# clubs/strategies/scopes/registry.py
from .open import OpenScopeStrategy
from .exclusive import ExclusiveScopeStrategy
from .intra import IntraScopeStrategy
from apps.clubs.models.enums import MembershipScope

class MembershipScopeRegistry:

    strategies = {
        MembershipScope.OPEN: OpenScopeStrategy,
        MembershipScope.EXCLUSIVE: ExclusiveScopeStrategy,
        MembershipScope.INTRA: IntraScopeStrategy,
    }

    @classmethod
    def resolve(cls, scope):
        strategy = cls.strategies.get(scope)

        if strategy is None:
            raise ValueError(
                f"Unsupported membership scope: {scope}"
            )

        return strategy()