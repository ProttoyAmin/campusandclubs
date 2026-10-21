from apps.media.models.enums import MediaStatus
from django.core.files.uploadedfile import UploadedFile
from apps.posts.models import Post
from apps.accounts.models.user import User
from apps.clubs.models import Club
from django.core.exceptions import ValidationError
from apps.media.models import Media
from apps.media.models.enums import MediaRole
from apps.media.constants import MAX_MEDIA_SIZE, ACCEPTED_CONTENT_TYPES
from core.services import BaseService, cloudinary_upload
from ..repositories import MediaRepository
from apps.media.dtos.media_upload_dto import MediaUploaDTO
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.base_user import AbstractBaseUser
from typing import Optional

TARGET_TYPE_MAP = {
    "club": Club,
    "user": User,
    "post": Post,
}

class MediaService(BaseService):
    repository_class = MediaRepository

    def __init__(
        self,
        actor: Optional[AbstractBaseUser] = None,
        repository: Optional[MediaRepository] = None,
    ) -> None:
        super().__init__(actor, repository)

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

    def upload(self, upload: dict, role: MediaRole, content_type: ContentType, object_id: int, original_file_name: str) -> Media:        
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

    def upload_media(self, dto: MediaUploaDTO) -> Media:
        model: Optional[type[Club] | type[User] | type[Post]] = TARGET_TYPE_MAP.get(dto.target_type)

        if not model:
            raise ValidationError({"target_type": f"No {dto.target_type} found with this id."})

        if dto.object_id and not model.objects.filter(id=dto.object_id).exists():
            raise ValidationError({"object_id": f"No {dto.target_type} found with this id."})

        if dto.file.size > MAX_MEDIA_SIZE:
            raise ValidationError({"file": f"Media size exceeds the limit. Maximum size is {MAX_MEDIA_SIZE / (1024 * 1024)}MB"})

        if dto.file.content_type not in ACCEPTED_CONTENT_TYPES:
            raise ValidationError({"file": f"Media type is not supported. Supported types are {', '.join(ACCEPTED_CONTENT_TYPES)}"})

        if dto.role not in MediaRole:
            raise ValidationError({"role": f"Role is not valid."})


        upload = self.upload_to_cloudinary(
            file=dto.file,
            folder=f"{dto.role}s/{dto.target_type}s/{dto.object_id}",
            file_name=dto.file.name,
        )

        if not upload:
            raise ValidationError({"file": f"Failed to upload media."})

        media = self.upload(upload, dto.role, ContentType.objects.get_for_model(model), dto.object_id, dto.file.name)

        return media
    
    def remove_uploaded_media(self, media: Media) -> None:
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

    def upload_to_cloudinary(self, file: UploadedFile, folder: str, file_name: str = None) -> dict:
        if file_name is None:
            file_name = file.name


        try:
            upload_result = cloudinary_upload.uploader.upload(
                file=file,
                folder=folder,
                file_name=file_name,
                use_filename=True if file_name else False,
                unique_filename=False if file_name else True,
            )
        except Exception as e:
            raise ValidationError({"file": f"Failed to upload media: {e}"})
        
        return upload_result

    def upload_video_to_cloudinary(
        self,
        file: UploadedFile,
        folder: str,
        file_name: str = None,
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