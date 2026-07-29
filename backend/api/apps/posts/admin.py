from django.contrib import admin
<<<<<<< HEAD
from . import models
# Register your models here.

admin.site.register(models.Post)
admin.site.register(models.PostMedia)
=======
from apps.posts.models import Post, PostMedia
# Register your models here.

admin.site.register(Post)
admin.site.register(PostMedia)
>>>>>>> v1
