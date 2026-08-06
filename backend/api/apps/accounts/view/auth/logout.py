from django.utils import timezone

from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError




class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated,]

    def post(self, request: Request) -> Response:
        from apps.accounts.config.constants import REFRESH_COOKIE, ACCESS_COOKIE

        try:
            refresh_token = request.COOKIES.get(REFRESH_COOKIE)
            if not refresh_token:
                raise KeyError()
            token = RefreshToken(refresh_token)
            token.blacklist()
            request.user.last_active = timezone.now()  # type: ignore
            request.user.save(update_fields=['last_active'])  # type: ignore
            
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie(ACCESS_COOKIE)
            response.delete_cookie(REFRESH_COOKIE)
            return response
        except KeyError:
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie(ACCESS_COOKIE)
            response.delete_cookie(REFRESH_COOKIE)
            return response
        except TokenError:
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie(ACCESS_COOKIE)
            response.delete_cookie(REFRESH_COOKIE)
            return response