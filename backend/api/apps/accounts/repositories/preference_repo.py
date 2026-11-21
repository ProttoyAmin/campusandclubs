from apps.accounts.dtos.profile_update_dto import UpdateUserDTO_minimal
from allauth.account.models import EmailAddress
from django.db.models import QuerySet
from core.repositories import BaseRepository
from apps.accounts.models import UserPreference, User
from apps.accounts.models.enums import MessageRequestChoice
from django.utils import timezone

class UserPreferenceRepository(BaseRepository[UserPreference]):
    model = UserPreference

    def get_queryset(self) -> QuerySet[UserPreference]:
        return super().get_queryset()

    def update_message_preference(self, user: User, m_preference: str) -> UserPreference:
        preference = UserPreference.objects.filter(user=user).first()
        preference.message_request_choice = m_preference                        #type: ignore
        preference.updated_at = timezone.now()                                      #type: ignore
        preference.save(update_fields=["message_request_choice", "updated_at"])               #type: ignore
        return UserPreference.objects.get(user=user)