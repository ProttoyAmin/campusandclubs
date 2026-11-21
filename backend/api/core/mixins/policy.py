
from typing import ClassVar, Generic, Optional, TypeVar, cast
from rest_framework.request import Request
from core.policies.base import Policy, RecordT
from apps.accounts.models import User
from core.policies.utils import current_user


PolicyT = TypeVar("PolicyT", bound=Policy)


class PolicyMixin(Generic[PolicyT, RecordT]):
    policy_class: ClassVar[Optional[type[Policy]]] = None

    def get_policy(self, request: Request | User, record: RecordT) -> PolicyT:
        assert self.policy_class is not None, f"{type(self).__name__} has no policy_class set"
        if isinstance(request, User):
            return cast(PolicyT, self.policy_class(request, record))
        else:
            return cast(PolicyT, self.policy_class(current_user(request), record))