from abc import ABC
from typing import (
    Any,
    ClassVar,
    Generic,
    TypeVar,
    Optional,
    cast,
    Unpack
)
from django.db.models import Model, QuerySet


T = TypeVar('T', bound=Model)


class BaseRepository(Generic[T], ABC):
    model: ClassVar[type[Model]]


    def get_queryset(self) -> QuerySet[T]:
        """Override in a subclass to scope queries (e.g. exclude soft-deleted rows)."""
        return cast(QuerySet[T], self.model._default_manager.get_queryset())

    def all(self) -> QuerySet[T]:
        return self.get_queryset()

    def only(self, *fields: str) -> QuerySet[T]:
        return self.get_queryset().only(*fields)
    
    def filter(self, **kwargs: Any) -> QuerySet[T]:
        return self.get_queryset().filter(**kwargs)

    def get(self, **kwargs: Any) -> T:
        return self.get_queryset().get(**kwargs)

    def get_or_none(self, **kwargs: Any) -> Optional[T]:
        return self.get_queryset().filter(**kwargs).first()

    def exists(self, **kwargs: Any) -> bool:
        return self.get_queryset().filter(**kwargs).exists()

    def create(self, **kwargs: Any) -> T:
        return cast(T, self.model._default_manager.create(**kwargs))

    def update(self, instance: T, **kwargs: Any) -> T:
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save(update_fields=list[str](kwargs.keys()))
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()