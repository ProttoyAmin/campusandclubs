from rest_framework import status, permissions, authentication
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer
from apps.accounts.schema import login_response
from core.response import ApiResponse
from allauth.headless.account.views import LoginView as HeadlessLoginView
from allauth.account.forms import LoginForm as AllauthLoginForm
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from allauth.headless.constants import Client
from allauth.headless.account.views import (
    LoginView as _AllauthLoginView
)
from ...services.auth_service import AuthService, AuthState
from ...serialize.auth.login import LoginInputSerializer
from ...serialize.auth.register import AuthStateSerializer



_login_view = _AllauthLoginView.as_api_view(
    client=Client.BROWSER
)

# @login_response
# class LoginView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer
    # form_class = AllauthLoginForm

    # def post(self, request: Request, *args, **kwargs) -> Response:
    #     from apps.accounts.config.constants import (
    #         REFRESH_COOKIE, ACCESS_COOKIE, COOKIE_MAX_AGE,
    #         REFRESH_COOKIE_MAX_AGE, COOKIE_SECURE, COOKIE_HTTPONLY,
    #         COOKIE_SAMESITE, COOKIE_PATH
    #     )

    #     response = super().post(request, *args, **kwargs)
    #     refresh = response.data.pop('refresh', None)
    #     access = response.data.pop('access', None)

    #     if refresh:
    #         response.set_cookie(
    #             key=REFRESH_COOKIE,
    #             value=refresh,
    #             max_age=REFRESH_COOKIE_MAX_AGE,
    #             httponly=COOKIE_HTTPONLY,
    #             secure=COOKIE_SECURE,
    #             samesite=COOKIE_SAMESITE,
    #             path=COOKIE_PATH,
    #         )

    #     if access:
    #         response.set_cookie(
    #             key=ACCESS_COOKIE,
    #             value=access,
    #             max_age=COOKIE_MAX_AGE,
    #             httponly=COOKIE_HTTPONLY,
    #             secure=COOKIE_SECURE,
    #             samesite=COOKIE_SAMESITE,
    #             path=COOKIE_PATH,
    #         )

    #     return response


def auth_response(state: AuthState, message: str, http_status=200) -> Response:
    return Response(
        {"success": True, "message": message, "data": AuthStateSerializer(state).data},
        status=http_status,
    )



@method_decorator([ensure_csrf_cookie, csrf_protect], name="dispatch")
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [authentication.SessionAuthentication]

    def post(self, request: Request):
        s = LoginInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        state = AuthService().login(request._request, s.validated_data)
        msg = "Signed in." if state.authenticated else "Verification required."
        return auth_response(state, msg)


@ensure_csrf_cookie
def login_view(request: Request, *args, **kwargs):
    """POST /api/v1/accounts/auth/login/

    Accepts allauth's LoginInput: by default ``{"username"|"email", "password"}``
    (depending on ``ACCOUNT_LOGIN_METHODS``). Returns allauth's
    AuthenticationResponse and sets the Django session cookie.
    """
    return _login_view(request, *args, **kwargs)