from django.db.models import QuerySet

from core.repositories import BaseRepository
from ..models import UserSession, User

class UserSessionRepository(BaseRepository[UserSession]):
    model = UserSession

    def upsert(self, *, session_key: str | None, user, **fields) -> UserSession:
        return UserSession.objects.update_or_create(
            session_key=session_key, defaults={"user": user, **fields}
        )[0]

    @staticmethod
    def flush(session_key: str) -> None:
        UserSession.objects.filter(
            session_key=session_key
        ).delete()

    def terminate_session(self, user: User, session_key: str) -> None:
        self.filter(user=user, session_key=session_key).delete()

    def list(self, user_id: str) -> QuerySet[UserSession]:
        return self.filter(user__id=user_id)