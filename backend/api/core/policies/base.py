from abc import ABC
from typing import Generic, TypeVar


ActorT = TypeVar("ActorT")
RecordT = TypeVar("RecordT")

class Policy(ABC, Generic[ActorT, RecordT]):
    """Base policy class.

    Holds authorization rules for a single model, keeping permission
    logic out of models, views, and serializers.
    """

    def __init__(self, actor: ActorT, record: RecordT) -> None:
        self.actor = actor      # the actor performing the action
        self.record = record  # the object being acted on
    