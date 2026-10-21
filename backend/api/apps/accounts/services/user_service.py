from apps.accounts.dtos.profile_update_dto import UpdateUserDTO_minimal
from apps.accounts.dtos.profile_update_dto import UpdateAttrs
from django.core.exceptions import ValidationError
from xml.dom import ValidationErr
from allauth.account.models import EmailAddress
import uuid
from django.db.models.query import QuerySet


from apps.accounts.models.user import User


import logging
from django.db.models import QuerySet

from core.services import BaseService
from apps.accounts.repositories import UserRepository
from apps.accounts.models import User
from core.context import RequestContext

logger = logging.getLogger(__name__)


class AccountService(BaseService[User, UserRepository]):
    """
    Account service class
    Account service class for business logic related to accounts
    """
    repository_class = UserRepository

    def get_object_or_404(self, user_id: uuid.UUID) -> User:
        return self.repository.get_queryset().filter(id=user_id).first()

    def list_users(self) -> QuerySet[User]:
        return self.repository.get_queryset()

    def get_by_username(self, username: str) -> QuerySet[User]:
        return self.repository.get_queryset().filter(username=username)

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
        
        return self.get_repository().update(self.user, dto)
