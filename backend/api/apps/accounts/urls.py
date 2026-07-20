from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from . import views


from apps.accounts.view.auth import (
    LoginView,
    LogoutView,
    RegisterView,
    get_request_info
)

from apps.accounts.view.user.generics import (
    ValidateUserTypeView,
    CompleteUserInfoView
)

from apps.accounts.view.user.common import (
    get_user_by_username,
    get_users,
    get_current_user,
    get_user_activity,
    get_user_clubs,
    UserRetrieveUpdateDestroyView,
    UserListCreateView
    
)

app_name = 'accounts'

router = DefaultRouter()
# router.register(r'auth/main', views.UserViewSet, basename='user')

urlpatterns = [
    # Djoser auth endpoints
    re_path(r'^auth/', include('djoser.urls')),
    # re_path(r'^auth/', include('djoser.urls.authtoken')),
    re_path(r'^auth/', include('djoser.urls.jwt')),

    path("auth/request-info/", get_request_info, name="request_info"),




    
    # Authentication endpoints
    path("auth/logout/", LogoutView.as_view(), name="jwt_logout"),
    path("auth/login/", LoginView.as_view(), name="jwt_obtain_token"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/validate/", ValidateUserTypeView.as_view(), name="validate_type"),
    
    # # User lookup
    path("auth/users/user/<str:username>/", UserRetrieveUpdateDestroyView.as_view(), name="user_details_by_username"),
    path('auth/all/', UserListCreateView.as_view(), name="all_users"),
    path('auth/<uuid:user_id>/all/', CompleteUserInfoView.as_view(), name="all_users_by_id"),
    
    # # Current user endpoints
    # path('auth/me/', get_current_user, name='current_user'),
    # path('auth/me/profile/', views.update_profile, name='update_profile'),
    # path("auth/me/upload-profile-picture/", views.upload_profile_picture, name="upload_profile_picture"),
    # path('auth/me/clear-profile-picture/', views.clear_profile_picture, name='clear_profile_picture'),
    # path('auth/me/email-preference/', views.manage_email_preference, name='email_preference'),
    
    # # User profiles
    # path('auth/<uuid:user_id>/', views.get_user_profile, name='user_profile'),
    path('auth/users/<uuid:user_id>/clubs/', get_user_clubs, name='user_clubs'),
    # path('auth/<uuid:user_id>/posts/', views.get_user_posts, name='user_posts'),
    path('auth/users/<uuid:user_id>/activity/', get_user_activity, name='user_activity'),
    
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
    # path('search/', views.search_users, name='search_users'),
    
    # # Include router URLs
    # path('', include(router.urls)),
]