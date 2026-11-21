from cloudinary import uploader
from .base import StoredMedia, MediaStorage
from django.core.files.uploadedfile import UploadedFile

class CloudinaryMediaStorage(MediaStorage):

    def save(self, file: UploadedFile, folder: str) -> dict:

        result = uploader.upload(
                file=file,
                folder=folder,
                file_name=file.name,
                use_filename=True if file.name else False,
                unique_filename=False if file.name else True,
            )

        return result