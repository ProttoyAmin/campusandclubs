from django.contrib import admin
from apps.taxonomy.models import Form, FormSubmission, FormAnswer, FormQuestion

# Register your models here.
admin.site.register(Form)
admin.site.register(FormSubmission)
admin.site.register(FormAnswer)
admin.site.register(FormQuestion)