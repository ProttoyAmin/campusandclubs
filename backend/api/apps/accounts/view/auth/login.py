from rest_framework import status
from rest_framework.request import Request
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer
from apps.accounts.schema import login_response
from core.response import ApiResponse

@login_response
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

