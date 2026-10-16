from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from . import views

from apps.accounts.view.auth import (
    RefreshTokenView,
    get_request_info,
)
from apps.accounts.view.auth.allauth_proxy import login, signup, logout, session

from apps.accounts.view.user.generics import (
    CompleteUserInfoView,
)

from apps.accounts.view.user.common import (
    get_current_user,
    get_user_activity,
    get_user_clubs,
    get_my_affiliations,
    get_my_emails,
    get_my_clubs,
    UserRetrieveUpdateDestroyView,
    UserListCreateView,
)

app_name = "accounts"

router = DefaultRouter()

urlpatterns = [
    # djoser/JWT endpoints are intentionally disabled — authentication is
    # handled end-to-end by django-allauth (session-based, headless)
    # through the proxy views below.
    # re_path(r'^auth/', include('djoser.urls')),

    # ------------------------------------------------------------------ #
    # Authentication (allauth headless, under our own namespace)
    # ------------------------------------------------------------------ #
    # POST {username/email, password}   -> log in (sets session cookie)
    path("auth/login/", login, name="login"),
    # POST {email, username?, password} -> sign up and log in
    path("auth/signup/", signup, name="signup"),
    # POST                               -> log out (clears session)
    path("auth/logout/", logout, name="logout"),
    # GET                                -> current session (user or 401)
    path("auth/session/", session, name="session"),

    path("auth/refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("auth/request-info/", get_request_info, name="request_info"),

    # User lookup
    path(
        "auth/users/user/<str:username>/",
        UserRetrieveUpdateDestroyView.as_view(),
        name="user_details_by_username",
    ),
    path("auth/all/", UserListCreateView.as_view(), name="all_users"),
    path(
        "auth/<uuid:user_id>/all/",
        CompleteUserInfoView.as_view(),
        name="all_users_by_id",
    ),

    path("auth/users/user/<str:username>/clubs/", get_user_clubs, name="user_clubs"),

    # Current user endpoints
    path("auth/me/", get_current_user, name="current_user"),
    path("auth/me/clubs/", get_my_clubs, name="my_clubs"),
    path("auth/me/affiliations/", get_my_affiliations, name="my_affiliations"),
    path("auth/me/emails/", get_my_emails, name="my_emails"),
    path(
        "auth/me/upload-profile-picture/",
        views.upload_profile_picture,
        name="upload_profile_picture",
    ),

    path("auth/users/<uuid:user_id>/posts/", views.get_user_posts, name="user_posts"),
    path(
        "auth/users/user/<str:username>/activity/",
        get_user_activity,
        name="user_activity",
    ),

    path("auth/search/", views.search_users, name="search_users"),
]
