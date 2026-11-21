
from django.conf import settings
from .storages.cloudinary import CloudinaryMediaStorage
from .storages.local import LocalMediaStorage


def get_media_storage():

    if settings.MEDIA_STORAGE_BACKEND == "cloudinary":
        return CloudinaryMediaStorage()

    if settings.MEDIA_STORAGE_BACKEND == "local":
        return LocalMediaStorage()

    raise ValueError("Unsupported media storage backend")