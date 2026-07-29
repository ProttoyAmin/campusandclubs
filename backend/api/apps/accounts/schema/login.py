from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse

from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

login_response = extend_schema(
    operation_id="login",
    summary='Log in',
    description="Authenticates a user with email or username and returns tokens.",
    tags=['Authentication'],
    request=CustomTokenObtainPairSerializer,
    responses={
        200: OpenApiResponse(
            response=TokenObtainPairSerializer,
            description="Login succeeded.",
        ),
        401: OpenApiResponse(description="Invalid credentials."),
    },
    examples=[
        OpenApiExample(
            "Basic login",
            value={"username_or_email": "asha@example.com", "password": "s3cret!"},
            request_only=True,
        ),
    ],
)