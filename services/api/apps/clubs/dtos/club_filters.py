from dataclasses import dataclass

@dataclass(frozen=True)
class ClubListFilters:
    joined: bool = False
    search: str | None = None
    privacy: str | None = None
    origin: str | None = None