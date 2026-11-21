from django.core.cache import cache


from typing import Optional
from apps.accounts.dtos.profile_update_dto import UpdateUserDTO_minimal
from apps.accounts.dtos.profile_update_dto import UpdateAttrs
from django.core.exceptions import PermissionDenied, ValidationError
from xml.dom import ValidationErr
from allauth.account.models import EmailAddress
import uuid
from django.db.models.query import QuerySet


from apps.accounts.models import User, UserPreference

import logging
from django.db.models import QuerySet

from apps.accounts.policies.user import UserPolicy
from apps.accounts.models.enums import MessageRequestChoice
from core.views.base import PolicyMixin
from core.services import BaseService
from apps.accounts.repositories import UserRepository, UserPreferenceRepository
from apps.accounts.models import User
from core.context import RequestContext

logger = logging.getLogger(__name__)


class AccountService(BaseService[User, UserRepository], PolicyMixin[UserPolicy, User]):
    """
    Account service class
    Account service class for business logic related to accounts
    """
    repository_class = UserRepository

    def __init__(self, actor: Optional[User] = None, repository: Optional[UserRepository] = None) -> None:
        super().__init__(actor, repository)
        self.preference = UserPreferenceRepository()

    def _user_profile_key(self, viewer: User) -> str:
        from ..utils.cache import get_user_profile_version

        version = get_user_profile_version()
        viewer_part = f"user:{viewer.id}" if viewer.is_authenticated else "anon"

        return f"user:profile:v:{version}:{viewer_part}"

    def _me_key(self, viewer: User) -> str:
        from ..utils.cache import get_user_profile_version

        version = get_user_profile_version()
        viewer_part = f"user:{viewer.id}" if viewer.is_authenticated else "anon"

        return f"user:me:v:{version}:{viewer_part}"


    def get_object_or_404(self, user_id: uuid.UUID) -> User:
        return self.repository.get_queryset().filter(id=user_id).first()

    def get_me(self, user: User) -> User:
        
        if not self.actor or not self.actor.is_authenticated:
            raise PermissionDenied()

        cache_key = self._me_key(viewer=self.actor)
        cached = cache.get(cache_key)

        if cached is not None:
            logger.info("Cache Hit!! for me data")
            return cached
        
        logger.info("Cache Miss for me data")
        me =  self.repository.get(id=user.id)
        cache.set(cache_key, me, timeout=60 * 5)
        logger.info("Me data cached for 5 minutes.")

        return me

    def list_users(self) -> QuerySet[User]:
        return self.repository.get_queryset()

    def get_by_username(self, username: str | None) -> User:

        if not self.actor or not self.actor.is_authenticated:
            raise PermissionDenied()

        if username is None:
            raise ValidationError("No username found")

        cached = cache.get(self._user_profile_key(viewer=self.actor))

        if cached is not None:
            logger.info("Cache Hit!! for profile data")
            return cached
        
        logger.info("Cache Miss for profile data")

        user =  self.repository.get(username=username)
        return user

    def get_by_professional_email(self, professional_email: str) -> QuerySet[User, User]:
        return self.repository.get_queryset().filter(professional_email=professional_email)

    def affiliation_exists(self, user: User, institute_id: uuid.UUID) -> bool:
        return user.affiliations.filter(institute_id=institute_id).exists()

    def professional_email_exists(self, professional_email: str) -> bool:
        return self.repository.get_queryset().filter(professional_email=professional_email).exists()

    def has_professional_email(self, user_id: uuid.UUID) -> bool:
        return self.repository.get_queryset().filter(id=user_id, professional_email__isnull=False).exists()

    def emails(self, user: User) -> QuerySet[EmailAddress]:
        return self.repository.emails(user)

    def update_privacy(self, user: User, is_private: bool) -> User:
        return self.repository.update(user, is_private=is_private)

    def update_message_privacy(self, user: User, message_preference: str) -> UserPreference:

        if not self.preference.filter(user=user).exists():
            self.preference.create(user=user)
            self.preference.update_message_preference(user, message_preference)
            return self.preference.get(user=user)
        
        if user.preferences.message_request_choice == message_preference:
            print("same. returning all pref")
            return self.preference.get(user=user)
        return self.preference.update_message_preference(user, message_preference)

    def update_user(self, data: UpdateAttrs) -> User:
        # Map UpdateAttrs to UpdateUserDTO_minimal
        dto_data = {}
        
        if 'first_name' in data:
            dto_data['first_name'] = data['first_name']
        else:
            dto_data['first_name'] = self.actor.first_name
        
        if 'last_name' in data:
            dto_data['last_name'] = data['last_name']
        else:
            dto_data['last_name'] = self.actor.last_name
        
        if 'bio' in data:
            dto_data['bio'] = data['bio']
        else:
            dto_data['bio'] = self.actor.bio
        
        if 'gender' in data:
            dto_data['gender'] = data['gender']
        else:
            dto_data['gender'] = self.actor.gender
        
        dto = UpdateUserDTO_minimal(**dto_data)
        
        return self.get_repository().update_user(self.user, dto)
