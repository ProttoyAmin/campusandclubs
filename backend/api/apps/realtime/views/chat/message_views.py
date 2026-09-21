"""REST views for messages (list, send, edit, delete, react, mark-seen)."""
from __future__ import annotations

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
from apps.realtime.schema import (
    message_delete_schema,
    message_edit_schema,
    message_list_schema,
    message_react_schema,
    message_seen_schema,
    message_send_schema,
    message_upload_schema,
)
from apps.realtime.serializers import (
    MessageCreateSerializer,
    MessageDeleteSerializer,
    MessageEditSerializer,
    MessageSerializer,
    MessageUploadSerializer,
    ReactionCreateSerializer,
    ReceiptSerializer,
)
from core.response import ApiResponse

from ._utils import chat_service


class MessageListView(generics.GenericAPIView):
    """``GET /chats/<chat_id>/messages/`` — paginated message history."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    @message_list_schema
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
    serializer_class = MessageCreateSerializer

    @message_send_schema
    def post(self, request: Request, chat_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        attachments = [
            MessageAttachmentDTO(
                file_url=a["file_url"],
                kind=a.get("kind", "file"),
                media_id=a.get("media_id"),
                thumb_url=a.get("thumb_url"),
                file_name=a.get("file_name"),
                mime_type=a.get("mime_type"),
                size_bytes=a.get("size_bytes"),
                width=a.get("width"),
                height=a.get("height"),
                duration_ms=a.get("duration_ms"),
            )
            for a in v.get("attachments", [])
        ]
        dto = MessageSendDTO(
            content=v.get("content", ""),
            reply_to=v.get("reply_to"),
            msg_type=v.get("msg_type", "TEXT"),
            client_msg_id=v.get("client_msg_id"),
            attachments=attachments,
        )
        svc = chat_service(request)
        message = svc.send_message(chat_id, dto)
        return ApiResponse(
            data=MessageSerializer(message, context={"request": request}).data,
            message="Message sent",
            status_code=status.HTTP_201_CREATED,
        )


class MessageUploadView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/messages/upload/`` — multipart/form-data
    endpoint that accepts raw files, uploads them to Cloudinary via the
    media repository, creates the message and its attachments, and
    broadcasts. One HTTP round-trip for a full message with media."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageUploadSerializer
    parser_classes = [MultiPartParser, FormParser]

    @message_upload_schema
    def post(self, request: Request, chat_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        files = list(v.get("attachments", []) or [])
        dto = MessageSendDTO(
            content=v.get("content", ""),
            reply_to=v.get("reply_to"),
            msg_type=v.get("msg_type", "TEXT"),
            client_msg_id=v.get("client_msg_id"),
            files=files,
        )
        svc = chat_service(request)
        message = svc.send_message(chat_id, dto)
        return ApiResponse(
            data=MessageSerializer(message, context={"request": request}).data,
            message="Message sent",
            status_code=status.HTTP_201_CREATED,
        )


class MessageEditView(generics.GenericAPIView):
    """``PATCH /messages/<message_id>/``"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageEditSerializer

    @message_edit_schema
    def patch(self, request: Request, message_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dto = MessageEditDTO(content=serializer.validated_data["content"])
        svc = chat_service(request)
        message = svc.edit_message(message_id, dto)
        return ApiResponse(
            data=MessageSerializer(message, context={"request": request}).data,
            message="Message edited",
        )


class MessageDeleteView(generics.GenericAPIView):
    """``POST /messages/<message_id>/delete/``"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageDeleteSerializer

    @message_delete_schema
    def post(self, request: Request, message_id) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mode = serializer.validated_data.get("mode", "FOR_ME")
        svc = chat_service(request)
        svc.delete_message(message_id, mode=mode)
        return ApiResponse(message="Message deleted")


class MessageReactionView(generics.GenericAPIView):
    """``POST /messages/reactions/`` — toggle a reaction."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReactionCreateSerializer

    @message_react_schema
    def post(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        v = serializer.validated_data
        dto = ReactionDTO(message_id=v["message_id"], emoji=v["emoji"])
        svc = chat_service(request)
        payload, created = svc.toggle_reaction(dto)
        return ApiResponse(
            data={**payload, "added": created},
            message="Reaction added" if created else "Reaction removed",
        )


class MessageSeenView(generics.GenericAPIView):
    """``POST /chats/<chat_id>/messages/seen/``"""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReceiptSerializer

    @message_seen_schema
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
