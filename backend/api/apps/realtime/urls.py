# apps/realtime/urls.py
from apps.realtime.views.chat.message_views import MessageSendView, MessageSeenView
from apps.realtime.views.chat.message_views import MessageListView
from django.urls import path
from .views.chat.chat_views import (
    ChatListView,
    ChatDetailView,
    ChatStartView,
    MessageEditView,
    GroupChatCreateView,
    ChatPendingView,
    ChatAcceptView,
    ChatDeclineView,
    ChatLeaveView,
    StartDirectChatView,
    ModelInfoTestView,
    ChatBlockView
)


app_name = 'realtime'

urlpatterns = [
    path("app-models/", ModelInfoTestView.as_view(), name="test_model_info"),
    path("chats/", ChatListView.as_view(), name="chat_list"),
    path("chats/start/", ChatStartView.as_view(), name="chat_start"),
    path("chats/start-dm/", StartDirectChatView.as_view(), name="start_dm"),
    path("chats/group/", GroupChatCreateView.as_view(), name="group_chat_create"),

    path("chats/<uuid:chat_id>/", ChatDetailView.as_view(), name="chat_detail"),
    path("chats/<uuid:chat_id>/accept/", ChatAcceptView.as_view(), name="chat_accept"),
    path("chats/<uuid:chat_id>/decline/", ChatDeclineView.as_view(), name="chat_decline"),
    path("chats/<uuid:chat_id>/leave/", ChatLeaveView.as_view(), name="chat_leave"),
    path("chats/<uuid:chat_id>/block/", ChatBlockView.as_view(), name="chat_block"),

    path(
        "chats/<uuid:chat_id>/messages/",
        MessageListView.as_view(),
        name="message_list"
    ),
    path(
        "chats/<uuid:chat_id>/messages/send/",
        MessageSendView.as_view(),
        name="message_send",
    ),
    path(
        "chats/<uuid:chat_id>/messages/seen/",
        MessageSeenView.as_view(),
        name="message_seen",
    ),
    path(
        "messages/<uuid:message_id>/",
        MessageEditView.as_view(),
        name="message_edit",
    ),

    path("chats/requests/", ChatPendingView.as_view(), name="chat_requests"),
]