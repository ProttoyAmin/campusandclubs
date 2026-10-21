"""REST views for messages (list, send, edit, delete, react, mark-seen)."""
from __future__ import annotations
from apps.realtime.serializers.chat.chat_serializers import ReceiptSerializer
from apps.realtime.serializers import MessageSendSerializer

from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.realtime.dtos.message import (
    MessageAttachmentDTO,
    MessageEditDTO,
    MessageListQueryDTO,
    MessageSendDTO,
    ReactionDTO,
    ReceiptDTO,
)
from apps.realtime.serializers import (
    MessageEditSerializer,
    MessageSerializer,
)
from core.response import ApiResponse

from .._utils import chat_service

class MessageListView(generics.GenericAPIView):
    """``GET /chats/<chat_id>/messages/`` — paginated message history."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get(self, request: Request, chat_id) -> Response:
        cursor = request.query_params.get("cursor")
        before_raw = request.query_params.get("before", "true")
        before = str(before_raw).lower() not in ("0", "false", "no")
        try:
            limit = int(request.query_params.get("limit", "50"))
        except (TypeError, ValueError):
            limit = 50
        limit = max(1, min(limit, 100))
        import uuid as _uuid
        cursor_parsed = None
        if cursor:
            try:
                cursor_parsed = _uuid.UUID(cursor)
            except (ValueError, AttributeError):
                cursor_parsed = None
        dto = MessageListQueryDTO(
            chat_id=chat_id, cursor=cursor_parsed, before=before, limit=limit,
        )
        svc = chat_service(request)
        qs = svc.list_messages(dto)
        return ApiResponse(
            data=MessageSerializer(qs, many=True, context={"request": request}).data,
            message="Messages",
        )

class MessageSendView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/messages/send/`` — JSON body, attachments
    passed as URL references (use the /media/ endpoint first to upload)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSendSerializer

    def post(self, request: Request, chat_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        dto = MessageSendDTO(
            content=v.get("content", ""),
            reply_to=v.get("reply_to"),
            client_msg_id=v.get("client_msg_id"),
        )
        svc = chat_service(request)
        message = svc.send_message(chat_id, dto)
        return ApiResponse(
            data=MessageSerializer(message, context={"request": request}).data,
            message="Message sent",
            status_code=status.HTTP_201_CREATED,
        )

class MessageSeenView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/messages/seen/``"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReceiptSerializer

    def post(self, request: Request, chat_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dto = ReceiptDTO(
            chat_id=chat_id,
            message_id=serializer.validated_data["message_id"],
            status="seen",
        )
        svc = chat_service(request)
        svc.mark_seen(dto)
        return Response(status=status.HTTP_204_NO_CONTENT)