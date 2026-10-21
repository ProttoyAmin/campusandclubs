from django.urls import path
from .views.generics.generic_views import SendEmailAPIView

urlpatterns = [
    path("emails/", SendEmailAPIView.as_view(), name="send_email"),
]