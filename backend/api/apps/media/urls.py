from django.urls import URLResolver
from django.urls import URLPattern
from apps.media.views import ListCreateMediaAPIView


from django.urls import path


urlpatterns: URLPattern | URLResolver = [
    path("", ListCreateMediaAPIView.as_view(), name="media"),
]