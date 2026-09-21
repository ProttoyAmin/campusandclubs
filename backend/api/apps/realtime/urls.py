"""URL configuration for ``apps.realtime``.

Backward compatibility
----------------------
Every URL path that existed before this refactor is preserved (same shape,
same HTTP method) so the existing React/Angular frontends continue to
work. New capabilities (accept/decline, delete, reactions, seen receipts,
message requests, start-dm) live at new, predictable paths under
``/api/v1/realtime/``.
"""
from django.urls import path

from .views import (
    ChatAcceptView,
    ChatBlockView,
    ChatDeclineView,
    ChatLeaveView,
    ChatListView,
    ChatRemoveMemberView,
    ChatStartView,
    GroupChatCreateView,
    MessageDeleteView,
    MessageEditView,
    MessageListView,
    MessageReactionView,
    MessageRequestsListView,
    MessageSeenView,
    MessageSendView,
    MessageUploadView,
    StartDirectChatView,
)

app_name = "realtime"

urlpatterns = [
    # Chat rooms
    path("chats/", ChatListView.as_view(), name="chat_list"),
    path("chats/start-dm/", StartDirectChatView.as_view(), name="chat_start_dm"),
    path("chats/start/", ChatStartView.as_view(), name="chat_start"),
    path("chats/group/", GroupChatCreateView.as_view(), name="group_chat_create"),
    path("chats/requests/", MessageRequestsListView.as_view(), name="message_requests"),
    path("chats/<uuid:chat_id>/accept/", ChatAcceptView.as_view(), name="chat_accept"),
    path("chats/<uuid:chat_id>/decline/", ChatDeclineView.as_view(), name="chat_decline"),
    path("chats/<uuid:chat_id>/leave/", ChatLeaveView.as_view(), name="chat_leave"),
    path("chats/<uuid:chat_id>/block/", ChatBlockView.as_view(), name="chat_block"),
    path("chats/<uuid:chat_id>/remove/", ChatRemoveMemberView.as_view(), name="chat_remove_member"),

    # Messages
    path(
        "chats/<uuid:chat_id>/messages/",
        MessageListView.as_view(),
        name="message_list",
    ),
    path(
        "chats/<uuid:chat_id>/messages/send/",
        MessageSendView.as_view(),
        name="message_send",
    ),
    path(
        "chats/<uuid:chat_id>/messages/upload/",
        MessageUploadView.as_view(),
        name="message_upload",
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
    path(
        "messages/<uuid:message_id>/delete/",
        MessageDeleteView.as_view(),
        name="message_delete",
    ),
    path(
        "messages/reactions/",
        MessageReactionView.as_view(),
        name="message_react",
    ),
]
