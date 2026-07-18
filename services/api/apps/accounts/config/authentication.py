# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.request import Request

# from apps.accounts.view.auth.login import ACCESS_COOKIE

# class CookieJWTAuthentication(JWTAuthentication):
    
#     def authenticate(self, request: Request):
#         header = self.get_header(request)
#         if header is not None:
#             raw_token = self.get_raw_token(header)
#         else:
#             cookie_token = request.COOKIES.get(ACCESS_COOKIE)
#             raw_token = cookie_token.encode("utf-8") if cookie_token is not None else None

#         if raw_token is None:
#             return None

#         validated_token = self.get_validated_token(raw_token)
#         return self.get_user(validated_token), validated_token