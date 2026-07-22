from dataclasses import dataclass

@dataclass(frozen=True)
class JoinDecision:
    allowed: bool
    requires_application: bool
    reason: str

@dataclass(frozen=True)
class Decision:
    allowed: bool
    reason: str

@dataclass(frozen=True)
class EditDecision:
    allowed: bool
    reason: str
