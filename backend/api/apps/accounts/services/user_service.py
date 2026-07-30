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

    def list_users(self) -> QuerySet[User]:
        return self.repository.get_queryset()
    
    def get_by_username(self, username: str) -> QuerySet[User]:
        return self.repository.get_queryset().filter(username=username)

    def get_by_professional_email(self, professional_email: str) -> QuerySet[User, User]:
        return self.repository.get_queryset().filter(professional_email=professional_email)

    def professional_email_exists(self, professional_email: str) -> bool:
        return self.repository.get_queryset().filter(professional_email=professional_email).exists()

    def has_professional_email(self, user_id: uuid.UUID) -> bool:
        return self.repository.get_queryset().filter(id=user_id, professional_email__isnull=False).exists()

