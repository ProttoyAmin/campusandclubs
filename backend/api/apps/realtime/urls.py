# apps/realtime/urls.py
from django.urls import path
from .views.chat.chat_views import (
    ChatListView,
    ChatStartView,
    MessageListView,
    MessageCreateView,
    MessageEditView,
    GroupChatCreateView,
    ChatPendingView
)


app_name = 'realtime'

urlpatterns = [
    path("chats/", ChatListView.as_view(), name="chat_list"),
    path("chats/start/", ChatStartView.as_view(), name="chat_start"),
    path("chats/<uuid:chat_id>/messages/",
         MessageListView.as_view(), name="message_list"),


    path("chats/group/", GroupChatCreateView.as_view(), name="group_chat_create"),

    path(
        "chats/<uuid:chat_id>/messages/send/",
        MessageCreateView.as_view(),
        name="message_send",
    ),
    path(
        "messages/<uuid:message_id>/",
        MessageEditView.as_view(),
        name="message_edit",
    ),

    path("chats/pending/", ChatPendingView.as_view(), name="chat_pending"),
]