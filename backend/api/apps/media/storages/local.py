from django.core.files.storage import default_storage
from django.core.files.uploadedfile import UploadedFile

from .base import MediaStorage, StoredMedia


class LocalMediaStorage(MediaStorage):

    def save(self, file: UploadedFile, folder: str) -> dict:

        saved = default_storage.save(f"{folder}/{file.name}", file)
        print("saved to local storage", saved)

        return {
            "name": saved,
            "url": default_storage.url(saved),
        }