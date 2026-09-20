from django.contrib import admin
from ..models import Chat, Message, ChatParticipant, MessageReaction


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "club", "created_at")
    list_filter = ("club", "created_at")
    search_fields = ("participants__email", "club__name")
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "sender", "created_at")
    search_fields = ("content", "chat__participants__email", "sender__email")

@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ("id", "message", "user", "emoji")
    search_fields = ("message__content", "user__email")

@admin.register(ChatParticipant)
class ChatParticipantAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "user", "status", "is_admin")
    list_filter = ("status", "is_admin")
    search_fields = ("chat__participants__email", "user__email")