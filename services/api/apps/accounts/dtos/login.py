from dataclasses import dataclass

@dataclass
class LoginDTO:
    username_or_email: str
    password: str
