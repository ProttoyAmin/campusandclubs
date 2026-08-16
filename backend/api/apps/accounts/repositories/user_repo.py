from allauth.account.models import EmailAddress
from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.accounts.models import User


class UserRepository(BaseRepository[User]):
    model = User

    def get_queryset(self) -> QuerySet[User]:
        return super().get_queryset().filter(deleted_at__isnull=True)

    def emails(self, user: User) -> QuerySet[EmailAddress]:
        return EmailAddress.objects.filter(user=user)
