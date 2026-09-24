# apps/realtime/serializers.py
from apps.realtime.models import ChatParticipant
from apps.accounts.serialize.user.profile import UserMinimalSerializer
from rest_framework import serializers
from apps.realtime.models import Chat, Message, MessageStatus


class ChatParticipentSerialier(serializers.ModelSerializer):
    user = UserMinimalSerializer()
    class Meta:
        model = ChatParticipant
        fields = ["id", "user", "status", "joined_at", "left_at"]
        read_only_fields = ["id", "user", "status", "joined_at", "left_at"]
    

class ChatAcceptSerializer(serializers.Serializer):
    chat_id = serializers.UUIDField()

class MessageStatusSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer()
    class Meta:
        model = MessageStatus
        fields = ["id", "message", "user", "status"]
        read_only_fields = ["id", "message", "user", "status"]



class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()
    statuses = serializers.SerializerMethodField()
    has_user_seen = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "chat", "sender", "content", "reply_to", "created_at", "edited_at", "statuses", "has_user_seen"]
        read_only_fields = ["id", "sender", "created_at", "edited_at"]
    
    def get_sender(self, obj: Message):
        from apps.accounts.serialize.user.profile import UserMinimalSerializer
        return UserMinimalSerializer(obj.sender).data

    def get_reply_to(self, obj: Message):
        if obj.reply_to:
            return MessageSerializer(obj.reply_to).data
        return None

    def get_statuses(self, obj: Message):
        return MessageStatusSerializer(obj.statuses.all(), many=True).data

    def get_has_user_seen(self, obj: Message):
        request = self.context.get("request")
        if request:
            return obj.statuses.filter(user=request.user, status=MessageStatus.Status.SEEN).exists()
        return False


class MessageSendSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)
    reply_to = serializers.UUIDField(required=False, allow_null=True)

class MessageEditSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)

class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participants = ChatParticipentSerialier(many=True)

    class Meta:
        model = Chat
        fields = ["id", "type", "name", "participants", "created_at", "last_message"]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return MessageSerializer(msg).data if msg else None

    # def get_participants(self, obj: Chat):
    #     request = self.context.get("request")
    #     qs = obj.participants.all()
    #     if request:
    #         qs = qs.exclude(user=request.user)
    #     return UserMinimalSerializer([p.user for p in qs], many=True).data

class ChatDetailSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participants = ChatParticipentSerialier(many=True)

    class Meta:
        model = Chat
        fields = ["id", "type", "name", "participants", "created_at", "last_message"]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        return MessageSerializer(msg).data if msg else None


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