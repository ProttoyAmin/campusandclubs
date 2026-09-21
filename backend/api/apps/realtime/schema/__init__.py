"""drf-spectacular schema decorators for the realtime app.

Each endpoint in ``views/`` is decorated with one of these to document
its request/response shape, operation id, and tags for the generated
OpenAPI spec (and therefore the TypeScript SDK).
"""
from .chat.chat_schemas import (
    accept_chat_schema,
    chat_list_schema,
    decline_chat_schema,
    group_create_schema,
    message_delete_schema,
    message_edit_schema,
    message_list_schema,
    message_react_schema,
    message_seen_schema,
    message_send_schema,
    message_upload_schema,
    start_chat_schema,
    start_dm_schema,
)
from .chat.request_schemas import message_requests_list_schema

__all__ = [
    "accept_chat_schema",
    "chat_list_schema",
    "decline_chat_schema",
    "group_create_schema",
    "message_delete_schema",
    "message_edit_schema",
    "message_list_schema",
    "message_react_schema",
    "message_requests_list_schema",
    "message_seen_schema",
    "message_send_schema",
    "message_upload_schema",
    "start_chat_schema",
    "start_dm_schema",
]
