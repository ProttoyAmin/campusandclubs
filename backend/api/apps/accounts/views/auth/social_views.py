
from core.views.base import AuthAPIView
from ...services.social_account_service import SocialAccountService
from apps.accounts.serializers.user.social_serializers import ProviderTokenSerializer, DisconnectProviderSerializer
from .login import auth_response
from rest_framework.response import Response
from rest_framework.request import Request

class ProviderLoginView(AuthAPIView):
    def post(self, request: Request):
        s = ProviderTokenSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        state = SocialAccountService().login_with_provider(request._request, s.validated_data)
        return auth_response(state, "Signed in." if state.authenticated else "Additional step required.")


class ProviderSignupView(AuthAPIView):
    def get(self, request: Request):
        return Response({"success": True, "data": SocialAccountService().get_pending_provider_signup(request._request)})

    def post(self, request: Request):
        state = SocialAccountService().complete_provider_signup(request._request, request.data)
        return auth_response(state, "Signed in." if state.authenticated else "Additional step required.")
