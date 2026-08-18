from rest_framework.exceptions import ValidationError
from apps.clubs.models.enums import Visibility, JoinMode
from apps.clubs.models.club.club import _ALLOWED_JOIN_MODES


def allowed_join_modes(privacy: Visibility, join_mode: JoinMode):
    allowed = _ALLOWED_JOIN_MODES.get(privacy, ())
    if join_mode not in allowed:
        raise ValidationError(
            {
                "join_mode": {
                    "message": f"{join_mode} is not valid for {privacy} clubs",
                    "allowed": f"{', '.join(allowed)}"
                }
            }
        )
