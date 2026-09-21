from django.urls import path

from apps.media.views import KindMediaUploadView, ListCreateMediaAPIView


urlpatterns = [
    # Kind-based upload (preferred frontend endpoint).
    # POST { kind, id?, role?, file|file[] } → 201 with created Media row(s).
    path("kind/", KindMediaUploadView.as_view(), name="kind_upload"),
    # Generic upload (admin/internal/legacy).
    path("", ListCreateMediaAPIView.as_view(), name="list_create_media"),
]
