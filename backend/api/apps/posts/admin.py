from django.contrib import admin
from apps.posts.models import Post, PostMedia
# Register your models here.

admin.site.register(Post)
admin.site.register(PostMedia)