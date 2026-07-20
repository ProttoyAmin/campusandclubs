from rest_framework import generics, permissions

from apps.accounts.serialize.auth.register import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny, )
    serializer_class = RegisterSerializer