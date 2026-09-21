"""Django admin registration for realtime models."""
from django.contrib import admin

from ..models import (
    Chat,
    ChatParticipant,
    Message,
    MessageAttachment,
    MessageReaction,
    MessageStatus,
    UserMessageHidden,
)


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fk_name = "chat"
    fields = ("id", "sender", "msg_type", "content", "created_at")
    readonly_fields = ("id", "created_at")
    show_change_link = True


class ParticipantInline(admin.TabularInline):
    model = ChatParticipant
    extra = 0
    fields = ("user", "status", "is_admin", "is_owner", "last_read_at")
    readonly_fields = ("joined_at", "updated_at")


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "name", "club", "created_at", "last_message_at")
    list_filter = ("type", "created_at")
    search_fields = ("name", "participants__user__username", "club__name")
    inlines = [ParticipantInline, MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "sender", "msg_type", "created_at", "deleted_mode")
    list_filter = ("msg_type", "deleted_mode", "created_at")
    search_fields = ("content", "sender__username")
    raw_id_fields = ("reply_to",)


@admin.register(MessageStatus)
class MessageStatusAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "user", "status", "delivered_at", "seen_at")
    list_filter = ("status",)
    raw_id_fields = ("message", "user")


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "kind", "file_name", "created_at")
    list_filter = ("kind",)


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "user", "emoji", "created_at")
    search_fields = ("message__content", "user__username")


@admin.register(ChatParticipant)
class ChatParticipantAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "user", "status", "is_admin", "is_owner", "last_read_at")
    list_filter = ("status", "is_admin", "is_owner")
    search_fields = ("user__username", "chat__name")


@admin.register(UserMessageHidden)
class UserMessageHiddenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "message", "created_at")
    raw_id_fields = ("user", "message")
