from django.contrib import admin
from apps.communications.models import (
    EmailRecipientStatus,
    EmailRecipientType,
    EmailStatus,
    Email,
    EmailRecipient
)
# Register your models here.

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ('subject', 'club', 'sender', 'status', 'sent_at')
    list_filter = ('status', 'created_at', 'sent_at')
    search_fields = ('subject', 'body')
    
@admin.register(EmailRecipient)
class EmailRecipientAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'recipient_type', 'status', 'sent_at')
    list_filter = ('status', 'recipient_type', 'sent_at')
    search_fields = ('email',)
