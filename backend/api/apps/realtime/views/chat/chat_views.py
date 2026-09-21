"""Chat-room REST views (list, create, start, accept, decline, requests).

All views are thin: validate input → build DTO → call service → serialize
response. No business logic lives here.
"""
from __future__ import annotations

from rest_framework import generics, permissions, serializers, status
from rest_framework.request import Request
from rest_framework.response import Response

from apps.realtime.dtos.chat import ChatActionDTO, ChatCreateDTO, ChatStartDTO, GroupChatCreateDTO
from apps.realtime.schema import (
    accept_chat_schema,
    chat_list_schema,
    decline_chat_schema,
    group_create_schema,
    message_requests_list_schema,
    start_chat_schema,
    start_dm_schema,
)
from apps.realtime.serializers import (
    ChatCreateSerializer,
    ChatSerializer,
    ChatStartSerializer,
    GroupChatCreateSerializer,
    MessageRequestSerializer,
    MessageSerializer,
)
from apps.realtime.services.chat_service import ChatService
from core.response import ApiResponse, ApiError

from ._utils import chat_service, current_user


class ChatListView(generics.GenericAPIView):
    """``GET``  list my chats. ``POST`` kept as a legacy alias for creating
    a DM (existing clients call ``POST /chats/``)."""

    permission_classes = [permissions.IsAuthenticated]

    @chat_list_schema
    def get(self, request: Request) -> Response:
        svc = chat_service(request)
        chats = svc.list_my_chats()
        data = ChatSerializer(
            chats, many=True, context={"request": request}
        ).data
        return ApiResponse(data=data, message="Chat list")

    @start_dm_schema
    def post(self, request: Request) -> Response:
        """Legacy endpoint — some clients start DMs via POST /chats/."""
        return StartDirectChatView().post(request)


class StartDirectChatView(generics.GenericAPIView):
    """Start or return an existing DM with a user."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatCreateSerializer

    @start_dm_schema
    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        svc = chat_service(request)
        dto = ChatCreateDTO(participant_id=serializer.validated_data["participant_id"])
        try:
            chat, is_new = svc.start_direct(dto)
        except ValueError as exc:  # pragma: no cover - shouldn't happen post-validation
            return ApiError(message=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        from rest_framework.exceptions import PermissionDenied as DRFPerm, ValidationError as DRFVal
        # PermissionDenied / ValidationError are raised by the service and
        # translated to 4xx by DRF's exception handler automatically.
        code = status.HTTP_201_CREATED if is_new else status.HTTP_200_OK
        return ApiResponse(
            data=ChatSerializer(chat, context={"request": request}).data,
            message="Chat started" if is_new else "Existing chat returned",
            status_code=code,
        )


class ChatStartView(generics.GenericAPIView):
    """``POST /chats/start/`` — get-or-create DM/group and send first message.

    This is the legacy "start" endpoint used by the existing frontend;
    kept intact with the same URL shape so clients don't break.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatStartSerializer

    @start_chat_schema
    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        dto = ChatStartDTO(
            participant_ids=v["participant_ids"],
            content=v["content"],
            name=v.get("name"),
            client_msg_id=v.get("client_msg_id"),
        )
        svc = chat_service(request)
        chat, message, is_new = svc.start_chat_and_send(dto)
        return ApiResponse(
            data={
                "chat": ChatSerializer(chat, context={"request": request}).data,
                "message": MessageSerializer(message, context={"request": request}).data,
                "created": is_new,
            },
            message="Message sent",
            status_code=status.HTTP_201_CREATED if is_new else status.HTTP_200_OK,
        )


class GroupChatCreateView(generics.GenericAPIView):
    """``POST /chats/group/`` — create a named group chat."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GroupChatCreateSerializer

    @group_create_schema
    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        svc = chat_service(request)
        chat = svc.create_group(
            GroupChatCreateDTO(
                name=v["name"],
                participant_ids=v["participant_ids"],
                description=v.get("description"),
            )
        )
        return ApiResponse(
            data=ChatSerializer(chat, context={"request": request}).data,
            message="Group chat created",
            status_code=status.HTTP_201_CREATED,
        )


class ChatAcceptView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/accept/``"""

    permission_classes = [permissions.IsAuthenticated]

    @accept_chat_schema
    def post(self, request: Request, chat_id) -> Response:
        svc = chat_service(request)
        chat = svc.accept_chat(ChatActionDTO(chat_id=chat_id))
        return ApiResponse(
            data=ChatSerializer(chat, context={"request": request}).data,
            message="Chat accepted",
        )


class ChatDeclineView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/decline/``"""

    permission_classes = [permissions.IsAuthenticated]

    @decline_chat_schema
    def post(self, request: Request, chat_id) -> Response:
        svc = chat_service(request)
        svc.decline_chat(ChatActionDTO(chat_id=chat_id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageRequestsListView(generics.GenericAPIView):
    """``GET /chats/requests/`` — pending DM requests for the current user."""

    permission_classes = [permissions.IsAuthenticated]

    @message_requests_list_schema
    def get(self, request: Request) -> Response:
        svc = chat_service(request)
        qs = svc.list_message_requests()
        return ApiResponse(
            data=MessageRequestSerializer(qs, many=True, context={"request": request}).data,
            message="Message requests",
        )


class _MemberIdPayload(serializers.Serializer):
    user_id = serializers.UUIDField()


class ChatLeaveView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/leave/`` — leave a chat you're a member of."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, chat_id) -> Response:
        svc = chat_service(request)
        svc.leave_chat(chat_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatRemoveMemberView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/remove/`` { user_id } — admin/owner kicks member."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, chat_id) -> Response:
        sz = _MemberIdPayload(data=request.data)
        sz.is_valid(raise_exception=True)
        svc = chat_service(request)
        svc.remove_member(chat_id, sz.validated_data["user_id"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatBlockView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/block/`` — block a DM."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Request, chat_id) -> Response:
        svc = chat_service(request)
        svc.block_chat(chat_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
