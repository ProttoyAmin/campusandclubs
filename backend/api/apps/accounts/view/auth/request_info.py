from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from pprint import pprint
from rest_framework import permissions

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_request_info(request: Request) -> Response:
    print("Request Info")
    pprint(request._stream.__dict__)
    return Response({
        'path': request.path,
        'method': request.method,
        'headers': dict[str, str](request.headers),
        'query_params': dict[str, str](request.query_params),
        'data': request.data,
        'user': str(request.user),
        'auth': str(request.auth),
        'META': dict[str, str](request.META),
    })
