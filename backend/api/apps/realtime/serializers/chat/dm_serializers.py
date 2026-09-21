"""Serializers for starting a direct-message chat."""
from __future__ import annotations

from rest_framework import serializers


class ChatCreateSerializer(serializers.Serializer):
    """Payload shape for ``POST /realtime/chats/start-dm/``.

    Kept separate from ``GroupChatCreateSerializer`` because DMs and group
    creation have different validation rules (DM: exactly one participant,
    group: one or more).
    """

    participant_id = serializers.UUIDField()
    first_message = serializers.CharField(
        max_length=5000, required=False, allow_blank=True, default=""
    )
