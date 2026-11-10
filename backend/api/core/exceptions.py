from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def _flatten(detail, param=None):
    if isinstance(detail, dict):
        for key, value in detail.items():
            yield from _flatten(value, None if key == "non_field_errors" else key)
    elif isinstance(detail, list):
        for item in detail:
            yield from _flatten(item, param)
    else:   # ErrorDetail (a str subclass) or str
        err = {"message": str(detail), "code": getattr(detail, "code", "invalid")}
        if param:
            err["param"] = param
        yield err


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    if isinstance(exc, APIException):
        response.data = {"errors": list(_flatten(exc.detail))}
    elif isinstance(response.data, dict) and "detail" in response.data:   # Http404, Django PermissionDenied
        d = response.data["detail"]
        response.data = {"errors": [{"message": str(d), "code": getattr(d, "code", "error")}]}
    return response