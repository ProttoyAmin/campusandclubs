import uuid
import logging
from ..repositories import MembershipApplicationRepository
from ..models import MembershipApplication
from core.services import BaseService

logger = logging.getLogger(__name__)


class ApplicationService(BaseService[MembershipApplication, MembershipApplicationRepository]):
    repository_class = MembershipApplicationRepository

    def get_application(
        self, club_id: uuid.UUID, application_id: uuid.UUID
    ) -> MembershipApplication:
        logger.info(f"Getting application for club {club_id} and application {application_id}")
        return self.repository.get_application(club_id=club_id, application_id=application_id)