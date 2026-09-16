from django.contrib import admin
from ..models import ChatRoom, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
    search_fields = ("participants__email",)
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "room", "sender", "created_at")
    search_fields = ("content", "room__participants__email", "sender__email")