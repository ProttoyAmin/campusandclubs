# apps/realtime/serializers.py
from apps.realtime.models import ChatParticipant
from apps.accounts.serialize.user.profile import UserMinimalSerializer
from rest_framework import serializers
from apps.realtime.models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "chat", "sender", "content", "reply_to", "created_at", "edited_at"]
        read_only_fields = ["id", "sender", "created_at", "edited_at"]
    
    def get_sender(self, obj: Message):
        from apps.accounts.serialize.user.profile import UserMinimalSerializer
        return UserMinimalSerializer(obj.sender).data

    def get_reply_to(self, obj: Message):
        if obj.reply_to:
            return MessageSerializer(obj.reply_to).data
        return None


class MessageSendSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)
    reply_to = serializers.UUIDField(required=False, allow_null=True)

class MessageEditSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)

class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ["id", "type", "participants", "created_at", "last_message"]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return MessageSerializer(msg).data if msg else None

    def get_participants(self, obj: Chat):
        request = self.context.get("request")
        qs = obj.participants.filter(status=ChatParticipant.Status.ACCEPTED)
        if request:
            qs = qs.exclude(user=request.user)
        return UserMinimalSerializer([p.user for p in qs], many=True).data

class ChatCreateSerializer(serializers.Serializer):
    participant_id = serializers.UUIDField()  # for starting a DM

class ChatStartSerializer(serializers.Serializer):
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1
    )
    content = serializers.CharField(max_length=5000)
    name = serializers.CharField(max_length=100, required=False, allow_blank=True)

class GroupChatCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1
    )