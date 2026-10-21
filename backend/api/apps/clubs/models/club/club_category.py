from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=20)
    description = models.TextField()
    slug = models.SlugField(max_length=20, unique=True)

    icon = models.ImageField(upload_to='clubs/images/category_icons/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name
