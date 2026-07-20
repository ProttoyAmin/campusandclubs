from typing import ClassVar, Generic, Optional, TypeVar, cast

from rest_framework import status
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer


ObjT = TypeVar("ObjT")


class PrivateResponseMixin(Generic[ObjT]):
    private_serializer_class: ClassVar[Optional[type[BaseSerializer]]] = None
    private_detail_message: ClassVar[str] = "This resource is private."

    def get_private_serializer(self, instance: ObjT, request) -> BaseSerializer:
        assert self.private_serializer_class is not None, (
            f"{type(self).__name__} has no private_serializer_class set"
        )
        return self.private_serializer_class(instance, context={"request": request})

    def get_private_payload(self, instance: ObjT, request) -> Response:
        serializer = self.get_private_serializer(instance, request)
        data = {"detail": self.private_detail_message, **serializer.data}
        return Response(data, status=status.HTTP_403_FORBIDDEN)