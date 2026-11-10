from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse

from apps.accounts.serializers.auth.login import CustomTokenObtainPairSerializer, LoginInputSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.schema import api_response

login_schema = extend_schema(
    operation_id="login",
    summary='Log in',
    description="Authenticates a user with email or username and returns tokens.",
    tags=['Authentication'],
    request=LoginInputSerializer,
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
            value={"login": "asha@example.com", "password": "s3cret!"},
            request_only=True,
            description="Here 'login' takes Username or Email"
        ),
    ],
)