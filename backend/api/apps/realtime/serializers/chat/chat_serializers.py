# apps/realtime/serializers.py
from rest_framework import serializers
from apps.realtime.models import ChatRoom, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "room", "sender", "sender_username", "content", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]

class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ["id", "participants", "created_at", "last_message"]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return ChatMessageSerializer(msg).data if msg else None

class ChatRoomCreateSerializer(serializers.Serializer):
    participant_id = serializers.UUIDField()  # for starting a DM

class ChatRoomStartSerializer(serializers.Serializer):
    participant_id = serializers.UUIDField()
    content = serializers.CharField(max_length=5000)