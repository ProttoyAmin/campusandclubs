from apps.accounts.views.auth.csrf import csrf_token_view
from apps.accounts.views.auth.allauth_proxy import ChangePasswordView
from apps.accounts.views.auth import (
    login_view, LoginView,
    logout as allauth_logout,
    signup_view,
    SignUpView,
    ConfirmEmailCodeView,
    ResendEmailCodeView,
    session_view,
    reset_password_view,
)
from apps.accounts.views.user.common.class_views import MeRetreiveUpdateView
from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from . import pre_views


from apps.accounts.views.auth import (
#     LoginView,
#     LogoutView,
#     RegisterView,
    get_request_info,
    RefreshTokenView
)

from apps.accounts.views.user.generics import (
    CompleteUserInfoView
)

from apps.accounts.views.user.common import (
    get_current_user,
    get_user_activity,
    get_user_clubs,
    get_my_affiliations,
    get_my_emails,
    get_my_clubs,
    UserRetrieveUpdateDestroyView,
    UserListCreateView

)

app_name = 'accounts'

router = DefaultRouter()
# router.register(r'auth/main', views.UserViewSet, basename='user')

urlpatterns = [
    # Djoser auth endpoints
#     re_path(r'^auth/', include('djoser.urls')),
    # re_path(r'^auth/', include('djoser.urls.authtoken')),
    #     re_path(r'^auth/', include('djoser.urls.jwt')),

    path("csrf/", csrf_token_view, name="csrf"),
#     path("auth/refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("request-info/", get_request_info, name="request_info"),


    # Authentication endpoints
    path("logout/", allauth_logout,
         name="logout"),      # ---- DONE
    #     path("auth/login/", LoginView.as_view(),
    #          name="jwt_obtain_token"),      # ---- DONE
    path("login/", LoginView.as_view(),
         name="login"),      # ---- DONE

    path("signup/", SignUpView.as_view(),
         name="signup"),      # ---- CHECKED

    path("session/", session_view,
         name="session"),      # ---- DONE
    path("email/verify/", ConfirmEmailCodeView.as_view(),
         name="email_verify"),      # ---- DONE
    path("email/verify/resend/", ResendEmailCodeView.as_view(),
         name="email_verify_resend"),      # ---- DONE

    path("change-password/", ChangePasswordView.as_view(),
         name="change_password"),      # ---- DONE
    path("reset-password/", reset_password_view,
         name="reset_password"),      # ---- DONE
    # path("auth/register/", RegisterView.as_view(), name="register"),        # ---- HANDLED BY DJOSER
    # path("auth/validate/", ValidateUserTypeView.as_view(), name="validate_type"),

    # # User lookup
#     path("auth/users/user/<str:username>/", UserRetrieveUpdateDestroyView.as_view(lookup_field='username'),
#          name="user_details_by_username"),  # DONE
#     #     path("auth/users/me/", MeRetreiveUpdateView.as_view(),
#     #          name="update_user_details"),  # DONE
#     path('auth/all/', UserListCreateView.as_view(),
#          name="all_users"),  # ---- DONE
#     path('auth/<uuid:user_id>/all/',
#          CompleteUserInfoView.as_view(), name="all_users_by_id"),


    # user lookups with username:
#     path('auth/users/user/<str:username>/clubs/',
#          get_user_clubs, name='user_clubs'),


    # # Current user endpoints
#     path('auth/me/', get_current_user, name='current_user'),
#     path('auth/me/clubs/', get_my_clubs, name='my_clubs'),
#     path('auth/me/affiliations/', get_my_affiliations, name='my_affiliations'),
#     path('auth/me/emails/', get_my_emails, name='my_emails'),
    # path('auth/me/profile/', views.update_profile, name='update_profile'),
#     path("auth/me/upload-profile-picture/",
#          views.upload_profile_picture, name="upload_profile_picture"),
    # path('auth/me/clear-profile-picture/', views.clear_profile_picture, name='clear_profile_picture'),
    # path('auth/me/email-preference/', views.manage_email_preference, name='email_preference'),

    # # User profiles
    # path('auth/<uuid:user_id>/', views.get_user_profile, name='user_profile'),
    # path('auth/users/<uuid:user_id>/clubs/', get_user_clubs, name='user_clubs'),
#     path('auth/users/<uuid:user_id>/posts/',
#          views.get_user_posts, name='user_posts'),
#     path('auth/users/user/<str:username>/activity/',
#          get_user_activity, name='user_activity'),

    # # User roles and permissions
    # path('auth/<uuid:user_id>/roles/', views.get_all_user_roles, name='user_all_roles'),
    # path('auth/<uuid:user_id>/roles/club/<uuid:club_id>/', views.get_user_roles_in_club, name='user_club_roles'),
    # path('clubs/<uuid:club_id>/users/<uuid:user_id>/assign-role/', views.assign_role_to_user, name='assign_role'),
    # path('clubs/<uuid:club_id>/users/<uuid:user_id>/remove-role/', views.remove_role_from_user, name='remove_role'),
    # path('clubs/<uuid:club_id>/users/<uuid:user_id>/check-permission/<str:permission>/',
    #      views.check_user_permission, name='check_permission'),

    # # Club role management
    # path('clubs/<uuid:club_id>/roles/<str:role_name>/users/', views.get_users_with_role, name='users_with_role'),

    # # Search
    path('auth/search/', pre_views.search_users, name='search_users'),

    # # Include router URLs
    # path('', include(router.urls)),
]
