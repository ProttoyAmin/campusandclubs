from drf_spectacular.utils import OpenApiRequest, extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse

from apps.accounts.serializers.auth.register import SignupSerializer, SignupResponseSerializer

register_schema = extend_schema(
    operation_id="register",
    summary='Register',
    description="Creates a new user account.",
    tags=['Authentication'],
    request=SignupSerializer,
    responses={
        201: OpenApiResponse(
            response=SignupResponseSerializer
        ),
        400: OpenApiResponse(
            description="Validation failed (duplicate email, weak password, etc.)."
        )
    }
)