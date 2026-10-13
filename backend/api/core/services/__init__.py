from .base import BaseService
import cloudinary
import cloudinary.api

cloudinary_upload = cloudinary
cloudinary_api = cloudinary.api


__all__ = [
    'BaseService',
    'cloudinary_uploader'
]