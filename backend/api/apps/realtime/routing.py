# apps/realtime/routing.py
from django.urls import re_path
from .consumers import AppSocketConsumer


websocket_urlpatterns = [
    re_path(r"ws/socket/$", AppSocketConsumer.as_asgi()),
]