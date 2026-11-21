from typing import ClassVar, Generic, Optional, TypeVar, cast
from rest_framework.request import Request
from core.services.base import BaseService
from apps.accounts.models import User
from core.policies.utils import current_user


ServiceT = TypeVar("ServiceT", bound=BaseService)

class ServiceMixin(Generic[ServiceT]):
    service_class: ClassVar[Optional[type[BaseService]]] = None

    def get_service(self, request: Request) -> ServiceT:
        assert self.service_class is not None, f"{type(self).__name__} has no service_class set"
        return cast(ServiceT, self.service_class(actor=current_user(request)))