from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from pprint import pprint
from rest_framework import permissions
import uuid

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_request_info(request: Request) -> Response:
    print("Request Info")
    pprint(request._stream.__dict__)
    data = {
    "uuid": {
        "uuid1": str(uuid.uuid1()),
        "uuid3": str(uuid.uuid3(
            uuid.NAMESPACE_DNS, "example.com"
        )),
        "uuid4": str(uuid.uuid4()),
        "uuid5": str(uuid.uuid5(
            uuid.NAMESPACE_DNS, "example.com"
        )),
    }
}
    return Response({
        'uuid-fields': data,
        'path': request.path,
        'method': request.method,
        'headers': dict[str, str](request.headers),
        'query_params': dict[str, str](request.query_params),
        'data': request.data,
        'user': str(request.user),
        'auth': str(request.auth),
        'META': dict[str, str](request.META),
    })
