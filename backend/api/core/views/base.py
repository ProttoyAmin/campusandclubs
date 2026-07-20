from typing import ClassVar, Generic, Optional, TypeVar, cast

from django.db.models import Model


from rest_framework import generics, status
from rest_framework.request import Request

from core.policies.base import Policy
from core.policies.utils import current_user
from core.services.base import BaseService

PolicyT = TypeVar("PolicyT", bound=Policy)
ServiceT = TypeVar("ServiceT", bound=BaseService)


class PolicyMixin(Generic[PolicyT]):
    policy_class: ClassVar[Optional[type[Policy]]] = None

    def get_policy(self, request: Request, record: Model) -> PolicyT:
        assert self.policy_class is not None, f"{type(self).__name__} has no policy_class set"
        return cast(PolicyT, self.policy_class(current_user(request), record))


class ServiceMixin(Generic[ServiceT]):
    service_class: ClassVar[Optional[type[BaseService]]] = None

    def get_service(self, request: Request) -> ServiceT:
        assert self.service_class is not None, f"{type(self).__name__} has no service_class set"
        return cast(ServiceT, self.service_class(actor=current_user(request)))


class BaseAPIView(generics.GenericAPIView, Generic[PolicyT, ServiceT]):
    policy_class: ClassVar[Optional[type[Policy]]] = None
    service_class: ClassVar[Optional[type[BaseService]]] = None

    def get_policy(self, request: Request, record) -> PolicyT:
        assert self.policy_class is not None, f"{self.__class__.__name__} has no policy_class set"
        return cast(PolicyT, self.policy_class(current_user(request), record))

    def get_service(self) -> ServiceT:
        assert self.service_class is not None, f"{self.__class__.__name__} has no service_class set"
        return cast(ServiceT, self.service_class())


