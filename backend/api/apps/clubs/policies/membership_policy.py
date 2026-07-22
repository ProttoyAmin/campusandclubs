from functools import cached_property
from typing import TypeVar
from apps.clubs.models import Club, Membership

from core.policies.base import Policy, ActorT, RecordT


class MembershipAwarePolicy(Policy[ActorT, RecordT]):
    """Mixin for policies whose authorization depends on the actor's
    club membership. Subclasses must implement `get_club()` to say
    which Club the membership check applies to.
    """

    def get_club(self) -> Club:
        raise NotImplementedError

    @cached_property
    def membership(self) -> Membership | None:
        return (
            Membership.objects
            .filter(user=self.actor, club=self.get_club())
            .select_related("primary_role")
            .prefetch_related("roles")
            .first()
        )

    def has_permission(self, permission_name: str) -> bool:
        return bool(self.membership and self.membership.has_permission(permission_name))