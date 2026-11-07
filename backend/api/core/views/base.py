from apps.accounts.models import User
from typing import ClassVar, Generic, Optional, TypeVar, cast

from django.db.models import Model


from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from core.policies.base import Policy, RecordT
from core.policies.utils import current_user
from core.services.base import BaseService

PolicyT = TypeVar("PolicyT", bound=Policy)
ServiceT = TypeVar("ServiceT", bound=BaseService)


class PolicyMixin(Generic[PolicyT, RecordT]):
    policy_class: ClassVar[Optional[type[Policy]]] = None

    def get_policy(self, request: Request | User, record: RecordT) -> PolicyT:
        assert self.policy_class is not None, f"{type(self).__name__} has no policy_class set"
        if isinstance(request, User):
            return cast(PolicyT, self.policy_class(request, record))
        else:
            return cast(PolicyT, self.policy_class(current_user(request), record))


class ServiceMixin(Generic[ServiceT]):
    service_class: ClassVar[Optional[type[BaseService]]] = None

    def get_service(self, request: Request) -> ServiceT:
        assert self.service_class is not None, f"{type(self).__name__} has no service_class set"
        return cast(ServiceT, self.service_class(actor=current_user(request)))


@method_decorator([ensure_csrf_cookie, csrf_protect], name="dispatch")
class AuthAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [SessionAuthentication]


class BaseAPIView(generics.GenericAPIView, Generic[PolicyT, ServiceT]):
    policy_class: ClassVar[Optional[type[Policy]]] = None
    service_class: ClassVar[Optional[type[BaseService]]] = None

    def get_policy(self, request: Request, record) -> PolicyT:
        assert self.policy_class is not None, f"{self.__class__.__name__} has no policy_class set"
        return cast(PolicyT, self.policy_class(current_user(request), record))

    def get_service(self) -> ServiceT:
        assert self.service_class is not None, f"{self.__class__.__name__} has no service_class set"
        return cast(ServiceT, self.service_class())


