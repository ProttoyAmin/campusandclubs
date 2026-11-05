from core.repositories import BaseRepository
from ..models import LoginRecord


class LoginRecordRepository(BaseRepository[LoginRecord]):
    model = LoginRecord