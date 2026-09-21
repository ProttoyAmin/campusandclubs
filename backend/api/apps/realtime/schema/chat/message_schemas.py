"""OpenAPI schemas for message-request endpoints."""
from __future__ import annotations

from drf_spectacular.utils import OpenApiResponse, extend_schema

from apps.realtime.serializers import MessageRequestSerializer


message_requests_list_schema = extend_schema(
    operation_id="list_message_requests",
    summary="List pending message requests",
    description=(
        "Returns pending direct-chat requests addressed to the current "
        "user. Accept or decline via /chats/<id>/accept and /decline."
    ),
    tags=["Chats · Requests"],
    responses={
        200: OpenApiResponse(
            MessageRequestSerializer(many=True),
            description="Pending message requests.",
        ),
        401: OpenApiResponse(description="Unauthorized."),
    },
)
