# apps/core/admin.py
from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from apps.clubs.models import Form
from apps.clubs.models.membership.form.form_question import FormQuestion


class FormQuestionInline(admin.TabularInline):
    model = FormQuestion
    extra = 1
    fields = ("question", "type", "required", "order")
    ordering = ("order",)


class FormInline(GenericTabularInline):
    model = Form
    extra = 0
    fields = ("title", "is_active", "created_by")
    ct_field = "content_type"
    ct_fk_field = "object_id"

@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ("title", "content_type", "object_id", "owner_display", "is_active", "created_by", "created_at")
    list_filter = ("content_type", "is_active")
    search_fields = ("title", "object_id")
    raw_id_fields = ("created_by",)
    ordering = ("-created_at",)
    inlines = [FormQuestionInline]

    def owner_display(self, obj):
        return str(obj.owner) if obj.owner else "—"
    owner_display.short_description = "Owner"


@admin.register(FormQuestion)
class FormQuestionAdmin(admin.ModelAdmin):
    list_display = ("question", "form", "type", "required", "order")
    list_filter = ("type", "required")
    search_fields = ("question", "form__title")
    raw_id_fields = ("form",)
    ordering = ("form", "order")