from abc import ABC
from typing import ClassVar, Generic, TypeVar, Optional, cast

from django.contrib.auth.base_user import AbstractBaseUser
from django.db.models import Model

from core.repositories.base import BaseRepository

T = TypeVar("T", bound=Model)
RepoT = TypeVar("RepoT", bound=BaseRepository)


class BaseService(Generic[T, RepoT], ABC):
    repository_class: ClassVar[Optional[type[BaseRepository]]] = None


    def __init__(
        self,
        actor: Optional[AbstractBaseUser] = None,
        repository: Optional[RepoT] = None
    ) -> None:
        self.actor = actor
        self.repository: RepoT = repository if repository is not None else self._default_repository()

    def _default_repository(self) -> RepoT:
        assert self.repository_class is not None, (
            f"{self.__class__.__name__} must set repository_class or receive a repository instance"
        )
        return cast(RepoT, self.repository_class())