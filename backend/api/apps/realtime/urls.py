# apps/realtime/urls.py
from django.urls import path
from .views.chat.chat_views import (
    ChatRoomListView,
    ChatRoomCreateView,
    ChatMessageListView,
    ChatRoomStartView
)


app_name = 'realtime'

urlpatterns = [
    path("chat/rooms/", ChatRoomListView.as_view(), name="chat_room_list"),
    path("chat/rooms/start/", ChatRoomStartView.as_view(), name="chat_room_start"),
    path("chat/rooms/<uuid:room_id>/messages/", ChatMessageListView.as_view(), name="chat_room_messages"),
]