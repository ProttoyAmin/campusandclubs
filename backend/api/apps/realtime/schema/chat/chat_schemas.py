"""OpenAPI schemas for chat + message endpoints."""
from __future__ import annotations

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema

from apps.realtime.serializers import (
    ChatCreateSerializer,
    ChatSerializer,
    ChatStartSerializer,
    GroupChatCreateSerializer,
    MessageCreateSerializer,
    MessageDeleteSerializer,
    MessageEditSerializer,
    MessageReactionSerializer,
    MessageSerializer,
    ReactionCreateSerializer,
    ReceiptSerializer,
)

_CHAT_ID_PARAM = OpenApiParameter(
    name="chat_id",
    type=OpenApiTypes.UUID,
    location=OpenApiParameter.PATH,
    description="Chat UUID.",
)
_MESSAGE_ID_PARAM = OpenApiParameter(
    name="message_id",
    type=OpenApiTypes.UUID,
    location=OpenApiParameter.PATH,
    description="Message UUID.",
)


chat_list_schema = extend_schema(
    operation_id="list_chats",
    summary="List my chats",
    description=(
        "Returns the authenticated user's accepted chats, ordered by "
        "most recent activity. Pending message requests are NOT included "
        "(see /chats/requests/)."
    ),
    tags=["Chats"],
    responses={
        200: OpenApiResponse(ChatSerializer(many=True), description="Chat list."),
        401: OpenApiResponse(description="Unauthorized."),
    },
)

start_dm_schema = extend_schema(
    operation_id="start_dm",
    summary="Start (or return) a direct chat",
    description=(
        "Get-or-create a one-to-one chat with another user. If a chat is "
        "already open, it is returned; otherwise a PENDING message request "
        "is created for the recipient."
    ),
    tags=["Chats"],
    request=ChatCreateSerializer,
    responses={
        200: OpenApiResponse(ChatSerializer, description="Existing DM returned."),
        201: OpenApiResponse(ChatSerializer, description="New DM created (request sent)."),
        400: OpenApiResponse(description="Validation failed."),
        403: OpenApiResponse(description="Blocked or invalid recipient."),
    },
)

start_chat_schema = extend_schema(
    operation_id="start_chat_with_message",
    summary="Start a chat and send the first message",
    description=(
        "Get-or-create a DM or create a new group chat, then persist the "
        "first message in a single atomic step. Mirrors the legacy "
        "`/chats/start/` endpoint used by existing web/mobile clients."
    ),
    tags=["Chats"],
    request=ChatStartSerializer,
    responses={
        200: OpenApiResponse(description="Message sent in existing chat."),
        201: OpenApiResponse(description="New chat created and message sent."),
        400: OpenApiResponse(description="Validation failed."),
        403: OpenApiResponse(description="Not allowed."),
    },
)

group_create_schema = extend_schema(
    operation_id="create_group_chat",
    summary="Create a group chat",
    description=(
        "Creates a named group chat. The caller is the owner/admin; all "
        "listed participants are added immediately as ACCEPTED members."
    ),
    tags=["Chats"],
    request=GroupChatCreateSerializer,
    responses={
        201: OpenApiResponse(ChatSerializer, description="Group chat created."),
        400: OpenApiResponse(description="Validation failed."),
    },
)

accept_chat_schema = extend_schema(
    operation_id="accept_chat",
    summary="Accept a pending chat",
    description="Accept a pending direct-chat request from another user.",
    tags=["Chats · Requests"],
    parameters=[_CHAT_ID_PARAM],
    responses={
        200: OpenApiResponse(ChatSerializer, description="Chat accepted."),
        400: OpenApiResponse(description="No pending request for this chat."),
    },
)

decline_chat_schema = extend_schema(
    operation_id="decline_chat",
    summary="Decline a pending chat",
    description="Decline a pending direct-chat request.",
    tags=["Chats · Requests"],
    parameters=[_CHAT_ID_PARAM],
    responses={204: OpenApiResponse(description="Declined.")},
)

message_list_schema = extend_schema(
    operation_id="list_messages",
    summary="List messages in a chat",
    description=(
        "Paginated message history. Use `cursor=<message_id>&before=true` "
        "to page backwards (older messages) or `before=false` to catch up "
        "on reconnection."
    ),
    tags=["Messages"],
    parameters=[
        _CHAT_ID_PARAM,
        OpenApiParameter(
            name="cursor", type=OpenApiTypes.UUID, location=OpenApiParameter.QUERY,
            required=False, description="Message UUID to page from.",
        ),
        OpenApiParameter(
            name="before", type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY,
            required=False, default=True,
            description="Load older (true) or newer (false) messages than the cursor.",
        ),
        OpenApiParameter(
            name="limit", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY,
            required=False, default=50, description="Page size (1-100).",
        ),
    ],
    responses={
        200: OpenApiResponse(MessageSerializer(many=True), description="Message page."),
        403: OpenApiResponse(description="Not a member of this chat."),
    },
)

message_send_schema = extend_schema(
    operation_id="send_message",
    summary="Send a message",
    description=(
        "Send a message to a chat. Supports an optional client-generated "
        "`client_msg_id` for idempotent retries."
    ),
    tags=["Messages"],
    parameters=[_CHAT_ID_PARAM],
    request=MessageCreateSerializer,
    responses={
        201: OpenApiResponse(MessageSerializer, description="Message sent."),
        400: OpenApiResponse(description="Validation failed."),
        403: OpenApiResponse(description="Not allowed to send here."),
    },
)

message_edit_schema = extend_schema(
    operation_id="edit_message",
    summary="Edit a message",
    description="Edit your own message within the 15-minute edit window.",
    tags=["Messages"],
    parameters=[_MESSAGE_ID_PARAM],
    request=MessageEditSerializer,
    responses={
        200: OpenApiResponse(MessageSerializer, description="Edited message."),
        403: OpenApiResponse(description="Edit not allowed (wrong author, expired window, etc.)."),
    },
)

message_delete_schema = extend_schema(
    operation_id="delete_message",
    summary="Delete a message",
    description=(
        "Delete a message. Pass `mode=FOR_ME` (default) to hide it only "
        "for yourself, or `mode=FOR_EVERYONE` to unsend it for everyone "
        "(sender only, within a 2-hour window)."
    ),
    tags=["Messages"],
    parameters=[_MESSAGE_ID_PARAM],
    request=MessageDeleteSerializer,
    responses={
        200: OpenApiResponse(description="Deleted."),
        403: OpenApiResponse(description="Not allowed."),
    },
)

message_react_schema = extend_schema(
    operation_id="toggle_reaction",
    summary="Toggle a reaction on a message",
    description="Adds the emoji if it doesn't exist; removes it if it does.",
    tags=["Messages"],
    request=ReactionCreateSerializer,
    responses={
        200: OpenApiResponse(description="Reaction toggled."),
        400: OpenApiResponse(description="Validation failed."),
    },
)

message_seen_schema = extend_schema(
    operation_id="mark_messages_seen",
    summary="Mark messages up to a point as seen",
    description=(
        "Marks every message in the chat up to (and including) "
        "`message_id` as seen by the caller. Used to render check-marks "
        "and decrement unread counts."
    ),
    tags=["Messages · Receipts"],
    parameters=[_CHAT_ID_PARAM],
    request=ReceiptSerializer,
    responses={
        204: OpenApiResponse(description="Seen receipts recorded."),
        403: OpenApiResponse(description="Not a member of this chat."),
    },
)
