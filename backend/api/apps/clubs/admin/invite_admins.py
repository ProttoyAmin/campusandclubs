from apps.clubs.models import InviteUsage
from django.contrib import admin
from apps.clubs.models import Invite


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ("id", "invite_type", "club", "status", "created_at", "expires_at")
    list_filter = ("invite_type", "status", "created_at", "club")
    search_fields = ("created_by__username", "club__name", "event__title")
    raw_id_fields = ("created_by", "club", "event")
    readonly_fields = ("created_at", "responded_at")

    fieldsets = (
        ("Invitation Info", {"fields": ("invite_type", "status", "message")}),
        ("Parties", {"fields": ("created_by",) }),
        ("Target", {"fields": ("club", "event")}),
        ("Timestamps", {"fields": ("created_at", "expires_at", "responded_at"), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("created_by", "club", "event")


@admin.register(InviteUsage)
class InviteUsageAdmin(admin.ModelAdmin):
    list_display = ("id", "invite", "user", "used_at", "ip_address", "user_agent")
    list_filter = ("invite", "user", "used_at")
    search_fields = ("user__username", "invite__code", "ip_address", "user_agent")
    raw_id_fields = ("invite", "user")
    readonly_fields = ("used_at", "ip_address", "user_agent")

    fieldsets = (
        ("Invitation Info", {"fields": ("invite",) }),
        ("Parties", {"fields": ("user",) }),
        ("Usage", {"fields": ("used_at", "ip_address", "user_agent")}),
    )