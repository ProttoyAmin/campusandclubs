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


