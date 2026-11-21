from abc import ABC, abstractmethod
from dataclasses import dataclass

from django.core.files.uploadedfile import UploadedFile

@dataclass
class StoredMedia:
    name: str
    url: str
    public_id: str | None = None
    resource_type: str | None = None
    format: str | None = None
    version: int | None = None
    width: int | None = None
    height: int | None = None
    duration: float | None = None

class MediaStorage(ABC):

    @abstractmethod
    def save(self, file: UploadedFile, folder: str) -> dict:
        pass