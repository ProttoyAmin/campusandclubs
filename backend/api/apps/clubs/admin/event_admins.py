


from django.contrib import admin
from apps.clubs.models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "club", "start_time", "end_time", "max_participants")
    list_filter = ("club", "created_at", "status")
    search_fields = ("title", "club__name", "creator__username", "location")
    raw_id_fields = ("club", "creator", "participants")
    filter_horizontal = ("participants",)

    fieldsets = (
        (None, {"fields": ("title", "description", "club", "creator")}),
        ("Time & Location", {"fields": ("start_time", "end_time", "location")}),
        ("Settings", {"fields": ("status", "max_participants", "image")}),
        ("Participants", {"fields": ("participants",), "classes": ("collapse",)}),
    )
