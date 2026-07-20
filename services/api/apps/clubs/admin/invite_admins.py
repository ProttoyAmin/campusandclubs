from django.contrib import admin
from apps.clubs.models import Invite


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ("id", "invite_type", "inviter", "invitee", "club", "event", "status", "created_at", "expires_at")
    list_filter = ("invite_type", "status", "created_at", "club")
    search_fields = ("inviter__username", "invitee__username", "club__name", "event__title")
    raw_id_fields = ("inviter", "invitee", "club", "event")
    readonly_fields = ("created_at", "responded_at")

    fieldsets = (
        ("Invitation Info", {"fields": ("invite_type", "status", "message")}),
        ("Parties", {"fields": ("inviter", "invitee")}),
        ("Target", {"fields": ("club", "event")}),
        ("Timestamps", {"fields": ("created_at", "expires_at", "responded_at"), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("inviter", "invitee", "club", "event")