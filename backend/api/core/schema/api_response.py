# core/schema.py
from drf_spectacular.utils import inline_serializer
from rest_framework import serializers


def api_response(inner, *, name: str, many: bool = False):
    """
    Wraps any serializer/field in the {success, message, data} envelope
    for schema purposes. `name` must be globally unique across your schema —
    it becomes the OpenAPI component name (and the generated TS type name).
    """
    data_field = inner.__class__(many=True) if many else inner
    return inline_serializer(
        name=name,
        fields={
            "success": serializers.BooleanField(),
            "message": serializers.CharField(),
            "data": data_field,
        },
    )