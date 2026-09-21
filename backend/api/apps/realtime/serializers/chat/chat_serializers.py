"""DRF serializers for chat resources.

These are the *contract* with the frontend. New fields are additive so
existing clients (React/Angular) keep working; no existing field has been
renamed or removed.
"""
from __future__ import annotations

from typing import Optional

from rest_framework import serializers

from apps.accounts.serialize.user.profile import UserMinimalSerializer
from apps.realtime.dtos.message import MessageAttachmentDTO
from apps.realtime.models.chat.chat import Chat
from apps.realtime.models.chat.enums import ChatType
from apps.realtime.models.chat.message import (
    Message,
    MessageAttachment,
    MessageDeleteMode,
    MessageStatus,
    MessageType,
)
from apps.realtime.models.chat.participants import ChatParticipant
from apps.realtime.models.chat.reaction import MessageReaction


# --------------------------------------------------------------------- #
# Attachments & reactions
# --------------------------------------------------------------------- #
class MessageAttachmentSerializer(serializers.ModelSerializer):
    media_id = serializers.UUIDField(read_only=True, source="media_id")

    class Meta:
        model = MessageAttachment
        fields = [
            "id",
            "kind",
            "media_id",
            "file_url",
            "thumb_url",
            "file_name",
            "mime_type",
            "size_bytes",
            "width",
            "height",
            "duration_ms",
        ]
        read_only_fields = fields


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = MessageReaction
        fields = ["user", "emoji", "created_at"]
        read_only_fields = fields


# --------------------------------------------------------------------- #
# Messages
# --------------------------------------------------------------------- #
class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    reactions = serializers.SerializerMethodField()
    # Deliver/read receipt summary for the current viewer.
    my_status = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "sender",
            "content",
            "msg_type",
            "client_msg_id",
            "reply_to",
            "attachments",
            "is_pinned",
            "reactions",
            "my_status",
            "created_at",
            "edited_at",
            "deleted_mode",
        ]
        read_only_fields = [
            "id",
            "sender",
            "created_at",
            "edited_at",
            "attachments",
            "reactions",
            "my_status",
        ]

    # DRF override so we can skip UserMessageHidden rows at the serializer
    # boundary (repository already filters, but safe to double-check here).
    def to_representation(self, instance: Message):
        if getattr(instance, "deleted_mode", None) == MessageDeleteMode.FOR_EVERYONE:
            # Render as tombstone; still include id/chat/created_at so the
            # UI knows where to place "This message was deleted".
            return {
                "id": str(instance.id),
                "chat": str(instance.chat_id),
                "sender": UserMinimalSerializer(instance.sender).data,
                "content": None,
                "msg_type": MessageType.SYSTEM,
                "client_msg_id": None,
                "reply_to": None,
                "attachments": [],
                "is_pinned": False,
                "reactions": {},
                "my_status": None,
                "created_at": instance.created_at.isoformat() if instance.created_at else None,
                "edited_at": None,
                "deleted_mode": instance.deleted_mode,
                "is_tombstone": True,
            }
        return super().to_representation(instance)

    def get_sender(self, obj: Message):
        return UserMinimalSerializer(obj.sender).data

    def get_reply_to(self, obj: Message):
        if obj.reply_to is None:
            return None
        return {
            "id": str(obj.reply_to.id),
            "sender": UserMinimalSerializer(obj.reply_to.sender).data,
            "content": obj.reply_to.content if obj.reply_to.deleted_mode != MessageDeleteMode.FOR_EVERYONE else None,
            "created_at": obj.reply_to.created_at.isoformat() if obj.reply_to.created_at else None,
        }

    def get_reactions(self, obj: Message):
        """Aggregate reactions by emoji -> list of users."""
        agg: dict[str, list] = {}
        for r in obj.reactions.all():
            agg.setdefault(r.emoji, []).append(UserMinimalSerializer(r.user).data)
        return agg

    def get_my_status(self, obj: Message):
        """Receipt status, always from the viewer's perspective:

        * For messages **sent by the viewer**, return the best receipt
          across all OTHER participants (what the sender sees):
              "seen"      → at least one recipient has read it (blue ticks)
              "delivered" → at least one recipient's device has received it
              "sent"      → otherwise (single tick)
        * For messages **received by the viewer**, return the viewer's own
          receipt (what the recipient sees for themselves; UIs usually
          don't render ticks on the other side's bubbles, but callers can
          use this for unread indicators).
        """
        request = self.context.get("request")
        if request is None or not getattr(request.user, "is_authenticated", False):
            return None
        viewer = request.user

        if obj.sender_id == viewer.id:
            # Aggregate across everyone except me.
            other_statuses = list(
                obj.statuses.exclude(user_id=viewer.id).values_list("status", flat=True)
            )
            if not other_statuses:
                # DM just created, or group with no other members yet → sent.
                return MessageStatus.Status.SENT
            if MessageStatus.Status.SEEN in other_statuses:
                return MessageStatus.Status.SEEN
            if MessageStatus.Status.DELIVERED in other_statuses:
                return MessageStatus.Status.DELIVERED
            return MessageStatus.Status.SENT

        # I'm a recipient — return my own receipt on this message.
        receipt = obj.statuses.filter(user=viewer).first()
        return receipt.status if receipt else MessageStatus.Status.SENT


# --------------------------------------------------------------------- #
# Write serializers — these turn HTTP JSON into validated primitive dicts
# that services translate into DTOs.
# --------------------------------------------------------------------- #
class MessageAttachmentInSerializer(serializers.Serializer):
    file_url = serializers.URLField(max_length=500)
    kind = serializers.ChoiceField(
        choices=["image", "video", "audio", "file"],
        default="file",
        required=False,
    )
    thumb_url = serializers.URLField(max_length=500, required=False, allow_null=True)
    file_name = serializers.CharField(max_length=255, required=False, allow_null=True)
    mime_type = serializers.CharField(max_length=100, required=False, allow_null=True)
    size_bytes = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    width = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    height = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    duration_ms = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    def to_dto(self, data: dict) -> MessageAttachmentDTO:
        return MessageAttachmentDTO(**data)


class MessageAttachmentRefSerializer(serializers.Serializer):
    """Reference to an already-uploaded attachment (by URL / media id)."""
    file_url = serializers.URLField(max_length=500)
    kind = serializers.ChoiceField(
        choices=["image", "video", "audio", "file"], default="file", required=False,
    )
    media_id = serializers.UUIDField(required=False, allow_null=True)
    thumb_url = serializers.URLField(max_length=500, required=False, allow_null=True)
    file_name = serializers.CharField(max_length=255, required=False, allow_null=True)
    mime_type = serializers.CharField(max_length=100, required=False, allow_null=True)
    size_bytes = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    width = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    height = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    duration_ms = serializers.IntegerField(required=False, allow_null=True, min_value=0)


class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000, allow_blank=True, default="")
    reply_to = serializers.UUIDField(required=False, allow_null=True)
    msg_type = serializers.ChoiceField(
        choices=MessageType.choices,
        default=MessageType.TEXT,
        required=False,
    )
    client_msg_id = serializers.UUIDField(required=False, allow_null=True)
    attachments = MessageAttachmentRefSerializer(many=True, required=False, default=list)


class MessageUploadSerializer(serializers.Serializer):
    """multipart/form-data serializer for sending a message with files.

    Files go straight to Cloudinary via the Media repository; other fields
    are standard form values.
    """
    content = serializers.CharField(max_length=5000, allow_blank=True, required=False, default="")
    reply_to = serializers.UUIDField(required=False, allow_null=True)
    msg_type = serializers.ChoiceField(
        choices=MessageType.choices,
        default=MessageType.TEXT,
        required=False,
    )
    client_msg_id = serializers.UUIDField(required=False, allow_null=True)
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False, default=list,
    )


# Legacy alias so existing imports ``MessageSendSerializer`` keep working.
MessageSendSerializer = MessageCreateSerializer


class MessageEditSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=5000)


class ReactionCreateSerializer(serializers.Serializer):
    emoji = serializers.CharField(max_length=32)
    message_id = serializers.UUIDField()


class MessageDeleteSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(
        choices=[(m.value, m.label) for m in MessageDeleteMode],
        default=MessageDeleteMode.FOR_ME,
        required=False,
    )


class ReceiptSerializer(serializers.Serializer):
    message_id = serializers.UUIDField()


# --------------------------------------------------------------------- #
# Chats
# --------------------------------------------------------------------- #
class _ParticipantField(serializers.SerializerMethodField):
    pass


class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "type",
            "name",
            "avatar",
            "description",
            "club",
            "is_pinned",
            "last_message_at",
            "participants",
            "created_at",
            "updated_at",
            "last_message",
            "unread_count",
        ]
        read_only_fields = fields

    def get_last_message(self, obj: Chat):
        # Use the denormalized timestamp if present; otherwise fall back to
        # the ORM lookup (back-compat for old rows).
        msg = obj.messages.order_by("-created_at").first()
        if msg is None:
            return None
        return MessageSerializer(msg, context=self.context).data

    def get_participants(self, obj: Chat):
        request = self.context.get("request")
        viewer = request.user if request else self.context.get("user")
        qs = obj.participants.filter(
            status=ChatParticipant.Status.ACCEPTED,
            left_at__isnull=True,
        )
        if viewer and getattr(viewer, "is_authenticated", False):
            qs = qs.exclude(user=viewer)
        return UserMinimalSerializer([p.user for p in qs], many=True).data

    def get_unread_count(self, obj: Chat):
        request = self.context.get("request")
        if request is None or not getattr(request.user, "is_authenticated", False):
            return 0
        me = ChatParticipant.objects.filter(chat=obj, user=request.user).first()
        if me is None or me.last_read_at is None:
            return obj.messages.exclude(sender=request.user).count()
        return obj.messages.filter(created_at__gt=me.last_read_at).exclude(
            sender=request.user
        ).count()


class GroupChatCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1,
    )


class ChatStartSerializer(serializers.Serializer):
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1,
    )
    content = serializers.CharField(max_length=5000)
    name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    client_msg_id = serializers.UUIDField(required=False, allow_null=True)


# --------------------------------------------------------------------- #
# Message requests
# --------------------------------------------------------------------- #
class MessageRequestSerializer(serializers.Serializer):
    """Serialize a pending DM Chat for the requests inbox.

    Returns the shape the frontend already expects from the previous
    MessageRequest model: ``id`` (request alias = chat id, so accept/
    decline endpoints keep working with chat ids), ``chat_id``,
    ``from_user`` (the other participant, i.e. the sender), ``content``
    (preview of the most recent message), ``status`` (always ``pending``),
    ``created_at`` (chat creation time)."""

    id = serializers.UUIDField(read_only=True)
    chat_id = serializers.UUIDField(read_only=True)
    from_user = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    status = serializers.CharField(read_only=True, default="pending")
    created_at = serializers.DateTimeField(read_only=True)

    def _viewer(self):
        request = self.context.get("request")
        return request.user if request else self.context.get("user")

    def get_from_user(self, obj: Chat):
        viewer = self._viewer()
        other = next(
            (p.user for p in obj.participants.all() if p.user_id != getattr(viewer, "id", None)),
            None,
        )
        return UserMinimalSerializer(other, context=self.context).data if other else None

    def get_content(self, obj: Chat) -> str:
        msg = obj.messages.order_by("-created_at").first()
        return msg.content if msg and msg.content is not None else ""

    def to_representation(self, obj: Chat):
        data = super().to_representation(obj)
        data["id"] = str(obj.id)
        data["chat_id"] = str(obj.id)
        data["status"] = "pending"
        data["created_at"] = obj.created_at
        return data
