from django.contrib import admin
from apps.clubs.models import Club, Category
from .role_admins import RoleInline
from .membership_admins import MembershipInline, MembershipApplicationFormInline

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "origin", "privacy", "status", "join_mode", "created_at")
    list_filter = ("privacy", "status", "join_mode", "origin", "scope")
    search_fields = ("name", "origin__name", "owner__username")
    inlines = [RoleInline, MembershipInline, MembershipApplicationFormInline]
    raw_id_fields = ("owner", "category")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")