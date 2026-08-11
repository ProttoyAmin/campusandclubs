from django.contrib import admin
from apps.media.models import Media


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_type', 'object_id', 'content_object', 'uploaded_at')
    list_filter = ('content_type', 'uploaded_at')
    search_fields = ('position',)
    readonly_fields = ('uploaded_at',)
