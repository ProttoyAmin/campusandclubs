from apps.media.models.enums import MediaStatus
from django.core.files.uploadedfile import UploadedFile
from apps.posts.models import Post
from apps.accounts.models.user import User
from apps.clubs.models import Club
from django.core.exceptions import ValidationError
from apps.media.models import Media
from apps.media.models.enums import MediaRole
from apps.media.constants import MAX_MEDIA_SIZE, ACCEPTED_CONTENT_TYPES
from apps.media.dependecies import get_media_storage
from core.services import BaseService, cloudinary_upload
from ..repositories import MediaRepository
from apps.media.dtos.media_upload_dto import MediaUploaDTO
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.base_user import AbstractBaseUser
from typing import Optional
from apps.media.storages.base import MediaStorage
from django.utils.text import get_valid_filename, slugify
from uuid import uuid4, UUID
from pathlib import Path

TARGET_TYPE_MAP = {
    "club": Club,
    "user": User,
    "post": Post,
}

class MediaService(BaseService):
    repository_class = MediaRepository

    def __init__(
        self,
        actor: Optional[User] = None,
        repository: Optional[MediaRepository] = None,
        storage: Optional[MediaStorage] = None,
    ) -> None:
        super().__init__(actor, repository)
        self.storage = storage or get_media_storage()

    def create(
        self,
        content_type: ContentType,
        object_id: int,
        file: UploadedFile,
        role: MediaRole,
        original_file_name: str,
        bytes: int,
        mime_type: str,
        public_id: str,
        secure_url: str,
        url: str,
        playback_url: str,
        format: str,
        version: int,
        status: MediaStatus,
        width: int,
        height: int,
        duration: float | None,
        resource_type: str,
        _raw: dict,
    ) -> Media:
        return self.repository.create(
            content_type=content_type,
            object_id=object_id,
            file=file,
            role=role,
            original_file_name=original_file_name,
            bytes=bytes,
            mime_type=mime_type,
            public_id=public_id,
            format=format,
            version=version,
            status=status,
            secure_url=secure_url,
            url=url,
            playback_url=playback_url,
            width=width,
            height=height,
            duration=duration,
            resource_type=resource_type,
            _raw=_raw,
        )

    def upload(self, upload: dict, role: MediaRole, content_type: ContentType, object_id: UUID, original_file_name: str) -> Media:        
        return self.create(
            content_type=content_type,
            object_id=object_id,
            role=role,
            original_file_name=original_file_name,
            file=upload.get('url'),
            secure_url=upload.get('secure_url'),
            playback_url=upload.get('playback_url') if upload.get('resource_type') == 'video' else None,
            url=upload.get('url'),
            bytes=upload.get('bytes'),
            mime_type=upload.get('format'),
            public_id=upload.get('public_id'),
            format=upload.get('format'),
            version=upload.get('version'),
            width=upload.get('width'),
            height=upload.get('height'),
            duration=upload.get('duration'),
            status=MediaStatus.READY if upload else MediaStatus.PENDING,
            resource_type=upload.get('resource_type'),
            _raw=upload,
        )

    def _generate_storage_name(
        self,
        filename: str,
        uploader: User,
        target_type: str,
        object_id: UUID,
    ) -> str:
        username = slugify(getattr(uploader, "username", "") or "user")
        user_id = uploader.pk

        original_name = Path(filename).name
        extension = Path(original_name).suffix.lower()
        original_stem = get_valid_filename(Path(original_name).stem) or "file"

        unique_name = f"{uuid4().hex}-{original_stem}{extension}"

        return (
            f"users/{username}-{user_id}/uploads/"
            f"{target_type.lower()}/{object_id or 'unattached'}/"
            f"{unique_name}"
        )

    def _validate_file(self, file: UploadedFile):

        if file.size is not None and file.size > MAX_MEDIA_SIZE:
            raise ValidationError({
                "file": "Media size exceeds the limit."
            })

        if file.content_type not in ACCEPTED_CONTENT_TYPES:
            raise ValidationError({
                "file": "Unsupported media type."
            })

    def upload_media(self, dto: MediaUploaDTO) -> Media:
        model: Optional[type[Club] | type[User] | type[Post]] = TARGET_TYPE_MAP.get(dto.target_type)

        if self.actor is None or not self.actor.is_authenticated:
            raise ValidationError({"actor": "User is not authenticated."})


        if model is None:
            raise ValidationError({
                "target_type": "Unsupported target type."
            })

        if not model:
            raise ValidationError({"target_type": f"No {dto.target_type} found with this id."})

        target = model.objects.filter(id=dto.object_id).exists()

        if target is None:
            raise ValidationError({
                "object_id": "Target object does not exist."
            })

        if dto.object_id and not model.objects.filter(id=dto.object_id).exists():
            raise ValidationError({"object_id": f"No {dto.target_type} found with this id."})

        self._validate_file(dto.file)

        if dto.role not in MediaRole:
            raise ValidationError({"role": f"Role is not valid."})

        from django.conf import settings

        if settings.DEBUG:
            stored = self.storage.save(dto.file, self._generate_storage_name(
                filename=dto.file.name or "",
                uploader=self.actor,
                target_type=dto.target_type,
                object_id=dto.object_id,
            ))
            print(f"File saved to {stored}")
            return Media.objects.create(
                content_type=ContentType.objects.get_for_model(model),
                object_id=dto.object_id,
                file=stored.name,
                original_file_name=dto.file.name,
                mime_type=dto.file.content_type,
                bytes=dto.file.size,
                role=dto.role,
                public_id=stored.public_id or "",
                resource_type=stored.resource_type or "",
                format=stored.format or "",
                version=stored.version,
                width=stored.width,
                height=stored.height,
                duration=stored.duration,
                url=stored.url,
                secure_url=stored.url,
                status=MediaStatus.READY,
            )


        upload = self.upload_to_cloudinary(
            file=dto.file,
            folder=f"{dto.role}s/{dto.target_type}s/{dto.object_id}",
            file_name=dto.file.name if dto.file.name else None,
        )

        if not upload:
            raise ValidationError({"file": f"Failed to upload media."})

        media = self.upload(upload, dto.role, ContentType.objects.get_for_model(model), dto.object_id, dto.file.name)

        return media
    
    def remove_uploaded_media(self, media: Media | None) -> None:
        if not media:
            raise ValidationError({"file": f"Media not found."})

        if not media.file:
            raise ValidationError({"file": f"Media file not found."})

        try:
            cloudinary_upload.uploader.destroy(media.file)
        except Exception as e:
            raise ValidationError({"file": f"Failed to delete media: {e}"})

        media.delete()
        return None

    def upload_to_cloudinary(self, file: UploadedFile, folder: str, file_name: str) -> dict:

        try:
            # upload_result = cloudinary_upload.uploader.upload(
            #     file=file,
            #     folder=folder,
            #     file_name=file_name,
            #     use_filename=True if file_name else False,
            #     unique_filename=False if file_name else True,
            # )
            upload_result = self.storage.save(file=file, folder=folder, filename=file_name)
        except Exception as e:
            raise ValidationError({"file": f"Failed to upload media: {e}"})
        
        return upload_result

    def upload_video_to_cloudinary(
        self,
        file: UploadedFile,
        folder: str,
        file_name: str | None = None,
    ):
        if file_name is None:
            file_name = file.name

        try:
            upload_result = cloudinary_upload.uploader.upload_large(
                file=file,
                folder=folder,
                file_name=file_name,
                use_filename=True if file_name else False,
                unique_filename=False if file_name else True,
                resource_type="video",
            )
        except Exception as e:
            raise ValidationError({"file": f"Failed to upload media: {e}"})
        
        return upload_result