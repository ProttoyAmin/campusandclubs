from django.contrib import admin
from .models import (
    Institute,
    InstituteEmailDomain,
    Department,
    AcademicProfile,
    InstituteAffiliate,
    InstituteRole
)

# Register your models here.

class InstituteTabluarInline(admin.TabularInline):
    model = InstituteEmailDomain
    extra = 1
    fields = (
        'domain',
        'domain_type',
        'is_active',
    )

@admin.register(Institute)
class InstituteAdmin(admin.ModelAdmin):
    list_display = ('code', 'country', 'created_at', 'updated_at', 'is_active',)
    list_filter = ('country', 'is_active', 'created_at')
    inlines = [InstituteTabluarInline, ]
    date_hierarchy = 'created_at'
    

    
    
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'institute', 'created_at', 'updated_at', 'is_active',)
    list_filter = ('institute', 'is_active', 'created_at')
    
    
@admin.register(InstituteEmailDomain)
class InstituteEmailDomainAdmin(admin.ModelAdmin):
    list_display = ('domain', 'institute', 'domain_type',)
    list_filter = ('institute', 'domain_type', 'is_active',)

@admin.register(AcademicProfile)
class AcademicProfileAdmin(admin.ModelAdmin):
    list_display = ('member', 'academic_email', 'department', 'student_id',)
    list_filter = ('member', 'department',)
    search_fields = ('member', 'academic_email', 'department', 'student_id',)

@admin.register(InstituteAffiliate)
class InstituteAffiliateAdmin(admin.ModelAdmin):
    list_display = ('institute', 'user', 'role',)
    list_filter = ('institute', 'role',)
    search_fields = ('institute', 'user', 'role',)
