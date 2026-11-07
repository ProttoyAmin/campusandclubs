from django.contrib import admin
from . import models
from django.contrib.sessions.models import Session

# Register your models here.
admin.site.register(models.UserPreference)
admin.site.register(models.LoginRecord)
admin.site.register(Session)

@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'id', 'type', 'created_at', 'updated_at', 'is_active')
    list_filter = ('type', 'created_at', 'is_active')
    search_fields = ('username', 'email', 'type')
    date_hierarchy = 'created_at'