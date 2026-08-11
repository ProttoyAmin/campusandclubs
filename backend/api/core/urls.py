"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)



urlpatterns = [
    path('admin/', admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/institutes/', include('apps.institutes.urls')),
    path('api/clubs/', include('apps.clubs.urls')),
    path('api/activities/', include('apps.interactions.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/connections/', include('apps.connections.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/media/', include('apps.media.urls')),

    path('api/_allauth/', include('allauth.headless.urls')),
    path('accounts/', include('allauth.urls')),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="docs",
    ),
]

if settings.DEBUG:
    # For files in STATICFILES_DIRS and app 'static' folders
    urlpatterns += staticfiles_urlpatterns()
    # For user-uploaded media
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
