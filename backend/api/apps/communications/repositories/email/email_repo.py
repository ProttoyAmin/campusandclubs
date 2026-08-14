from core.repositories import BaseRepository
from apps.communications.models import Email

class EmailRepository(BaseRepository[Email]):
    model = Email
    