from drf_spectacular.utils import OpenApiRequest, extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse

from apps.accounts.serialize.auth.register import RegisterSerializer
from apps.accounts.serialize.auth.register import RegisterResponseSerializer

register_schema = extend_schema(
    operation_id="register",
    summary='Register',
    description="Creates a new user account.",
    tags=['Authentication'],
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(
            response=RegisterResponseSerializer
        ),
        400: OpenApiResponse(
            description="Validation failed (duplicate email, weak password, etc.)."
        )
    }
)