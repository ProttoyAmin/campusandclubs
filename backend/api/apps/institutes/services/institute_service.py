from core.services import BaseService
from apps.institutes.repositories import InstituteRepository
from apps.institutes.models import Institute
from django.db.models import QuerySet

class InstituteService(BaseService[Institute, InstituteRepository]):
    """Institute service class"""
    repository_class = InstituteRepository

    def list_institutes(self) -> QuerySet[Institute]:
        return self.repository.get_queryset()

    def get_institute(self, id: int) -> Institute:
        return self.repository.get(id=id)
    