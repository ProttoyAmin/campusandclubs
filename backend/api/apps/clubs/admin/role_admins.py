from django.contrib import admin
from apps.clubs.models import Role




class RoleInline(admin.TabularInline):
    model = Role
    extra = 0
    fields = ("name", "permissions", "is_default", "color")


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "club", "is_default")
    list_filter = ("club", "is_default")
    search_fields = ("name", "club__name")
    raw_id_fields = ("club",)

    fieldsets = (
        (None, {"fields": ("club", "name", "color", "is_default")}),
        ("Permissions", {"fields": ("permissions",)}),
    )

    readonly_fields = ("created_at", "updated_at")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("club")