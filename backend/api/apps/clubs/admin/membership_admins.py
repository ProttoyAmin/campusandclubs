from django.contrib import admin

from apps.clubs.models import (
    FormAnswer,
    FormSubmission,
    Membership,
    MembershipApplication,
    MembershipDepartment,
    Role,
)


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    raw_id_fields = ("user", "primary_role", "application")


class FormAnswerInline(admin.TabularInline):
    model = FormAnswer
    extra = 0
    fields = ("question", "answer")
    raw_id_fields = ("question",)


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "respondent", "submitted_at")
    list_filter = ("form",)
    search_fields = ("respondent__username", "form__title")
    raw_id_fields = ("form", "respondent")
    readonly_fields = ("submitted_at", "updated_at")
    inlines = [FormAnswerInline]


class FormSubmissionInline(admin.StackedInline):
    """Show the filled-in answers inline on the application admin page."""

    model = FormSubmission
    extra = 0
    max_num = 1
    fields = ("form", "respondent", "submitted_at")
    readonly_fields = ("form", "respondent", "submitted_at")
    show_change_link = True


admin.site.register(MembershipDepartment)


@admin.register(MembershipApplication)
class MembershipApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "club",
        "applicant",
        "status",
        "reviewed_by",
        "reviewed_at",
        "created_at",
    )
    list_filter = ("club", "status", "created_at")
    search_fields = ("club__name", "applicant__username")
    raw_id_fields = ("club", "applicant", "reviewed_by", "submission")
    readonly_fields = ("created_at", "updated_at")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("club", "applicant", "reviewed_by", "submission")
        )


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "club", "get_role_names", "primary_role_name", "joined_at")
    list_filter = ("club", "roles", "joined_at")
    search_fields = ("user__username", "club__name", "roles__name")
    raw_id_fields = ("user", "club", "primary_role", "application")
    filter_horizontal = ("roles",)

    fieldsets = (
        (
            "Membership Info",
            {"fields": ("user", "club", "primary_role", "application")},
        ),
        (
            "Roles",
            {
                "fields": ("roles",),
                "description": "Select multiple roles for this member",
            },
        ),
        (
            "Timestamps",
            {"fields": ("joined_at",), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ("joined_at",)

    def get_role_names(self, obj: Membership) -> str:
        return ", ".join(role.name for role in obj.roles.all())

    get_role_names.short_description = "Roles"  # type: ignore

    def primary_role_name(self, obj: Membership) -> str:
        return obj.primary_role.name if obj.primary_role else "None"

    primary_role_name.short_description = "Primary Role"  # type: ignore

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "roles":
            club_id = self._get_club_id(request)
            if club_id:
                kwargs["queryset"] = Role.objects.filter(club_id=club_id)
            else:
                kwargs["queryset"] = Role.objects.none()
                kwargs["help_text"] = (
                    "Please select a club first, then save and edit to assign roles."
                )
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "primary_role":
            club_id = self._get_club_id(request)
            if club_id:
                kwargs["queryset"] = Role.objects.filter(club_id=club_id)
            else:
                kwargs["queryset"] = Role.objects.none()
                kwargs["help_text"] = (
                    "Please select a club first, then save and edit to assign primary role."
                )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def _get_club_id(self, request):
        if request.method == "POST":
            return request.POST.get("club")
        if getattr(request, "_obj_", None) is not None:
            return request._obj_.club_id
        object_id = request.resolver_match.kwargs.get("object_id")
        if object_id:
            membership = Membership.objects.filter(pk=object_id).first()
            return membership.club.id if membership else None
        return None

    def get_form(self, request, obj=None, **kwargs):  # type: ignore
        request._obj_ = obj
        return super().get_form(request, obj, **kwargs)
