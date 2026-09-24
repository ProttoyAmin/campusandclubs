"""Channel-layer broadcast helpers.

We deliberately provide both sync and async variants. The REST views run in
a sync context and use ``async_to_sync``; the Channels consumer runs on the
event loop and must use ``await`` to avoid deadlocking the loop.

Every broadcast fires inside ``transaction.on_commit`` when called from a
sync context with an active atomic block, so we never push a socket event
for a DB row that hasn't committed yet.
"""
from __future__ import annotations

import json
import logging
from typing import Any
from uuid import UUID

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction

from .events import (
    chat_group,
    notification_group,
)

logger = logging.getLogger(__name__)


def _serialize_payload(data: Any) -> Any:
    """Make payload JSON-safe (UUIDs, datetimes, etc.)."""
    return json.loads(json.dumps(data, default=str))


def _get_layer():
    return get_channel_layer()


# ---------------------------------------------------------------------- #
# Sync API (for REST views / services called from sync code)
# ---------------------------------------------------------------------- #
def broadcast_sync(chat_id: UUID, event_type: str, data: dict) -> None:
    """Send ``data`` to every client in the ``chat_{chat_id}`` group.

    Safe to call from sync views. If called inside an atomic block the
    actual send is deferred until the transaction commits.
    """
    payload = _serialize_payload(data)

    def _send():
        try:
            async_to_sync(_get_layer().group_send)(
                chat_group(chat_id),
                {"type": event_type, "data": payload},
            )
        except Exception:  # pragma: no cover — defensive logging
            logger.exception("Broadcast failed on chat %s", chat_id)

    if transaction.get_connection().in_atomic_block:
        transaction.on_commit(_send)
    else:
        _send()


def broadcast_to_user_sync(user_id: UUID, event_type: str, data: dict) -> None:
    """Send to a user's personal notification group."""
    payload = _serialize_payload(data)

    def _send():
        try:
            async_to_sync(_get_layer().group_send)(
                notification_group(user_id),
                {"type": event_type, "data": payload},
            )
        except Exception:  # pragma: no cover
            logger.exception("Broadcast failed to user %s", user_id)

    if transaction.get_connection().in_atomic_block:
        transaction.on_commit(_send)
    else:
        _send()


# ---------------------------------------------------------------------- #
# Async API (for Channels consumers)
# ---------------------------------------------------------------------- #
async def broadcast_async(chat_id: UUID, event_type: str, data: dict) -> None:
    layer = _get_layer()
    payload = _serialize_payload(data)
    await layer.group_send(
        chat_group(chat_id),
        {"type": event_type, "data": payload},
    )


async def broadcast_to_user_async(
    user_id: UUID, event_type: str, data: dict
) -> None:
    layer = _get_layer()
    payload = _serialize_payload(data)
    await layer.group_send(
        notification_group(user_id),
        {"type": event_type, "data": payload},
    )
