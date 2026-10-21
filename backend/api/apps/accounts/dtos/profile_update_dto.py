from typing import TypedDict
from dataclasses import dataclass


class UpdateAttrs(TypedDict, total=False):
        first_name: str
        last_name: str
        bio: str
        gender: str

@dataclass
class UpdateUserDTO_minimal:
    first_name: str | None = None
    last_name: str | None = None
    bio: str | None = None
    gender: str | None = None