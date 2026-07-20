from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

