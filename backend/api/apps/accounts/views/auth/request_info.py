from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from pprint import pprint
from rest_framework import permissions, serializers
import uuid

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_request_object(request: Request) -> Response:
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


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_session_object(request: Request) -> Response:
    from django.contrib.sessions.models import Session
    session = Session.objects.get(session_key=request.session.session_key)
    encoded = Session.objects.encode(session.session_data)
    
    return Response({
        "key" : session.session_key,
        "data" : session.session_data,
        "encoded" : encoded,
        "decoded" : session.get_decoded(),
        "constraints" : [serializers.Serializer(constraint) for constraint in session.get_constraints()],
        "fields" : [session.clean_fields()],
    })

