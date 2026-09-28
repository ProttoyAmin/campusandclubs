from core.services import BaseService
from ..repositories import NotificationRepository
from ..models import Notification
from apps.accounts.models import User

class NotificationService(BaseService[Notification, NotificationRepository]):
    repository_class = NotificationRepository
    
    def list(self):
        return self.repository.get_queryset()

    def list_user_notifications(self, user: User):
        return self.repository.get_user_notifications(user)