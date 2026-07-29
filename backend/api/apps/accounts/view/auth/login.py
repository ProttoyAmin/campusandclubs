from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.serialize.auth.login import CustomTokenObtainPairSerializer
from apps.accounts.schema import login_response

@login_response
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

