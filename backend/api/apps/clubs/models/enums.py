from django.db import models

class Visibility(models.TextChoices):
    PUBLIC = 'public', 'Public'
    PRIVATE = 'private', 'Private'
    SECRET = 'secret', 'Secret'

class ClubStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    PAUSED = "paused", "Paused"
    ARCHIVED = "archived", "Archived"
    SUSPENDED = "suspended", "Suspended"

class JoinMode(models.TextChoices):
    INSTANT = "instant", "Instant"
    APPLICATION = "application", "Application Required"
    INVITE_ONLY = "invite_only", "Invite Only"

class AffiliateStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACTIVE = 'active', 'Active'
    REJECTED = 'rejected', 'Rejected'
    LEFT = 'left', 'Left'
    BANNED = 'banned', 'Banned'

class MembershipScope(models.TextChoices):
    OPEN = 'open', 'Open'
    EXCLUSIVE = 'exclusive', 'Exclusive'
    INTRA = 'intra', 'Intra'

class ApplicationDecision(models.TextChoices):
    MANUAL = "manual", "Manual Review"
    AUTO_ACCEPT = "auto_accept", "Auto Accept"


class EventStatus(models.TextChoices):
    UPCOMING = "upcoming", "Upcoming"
    ONGOING = "ongoing", "Ongoing"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"

class InviteType(models.TextChoices):
    CLUB = "club", "Club"
    EVENT = "event", "Event"

class InviteStatus(models.TextChoices):
    ONGOING = 'ongoing', 'Ongoing'
    EXPIRED = 'expired', 'Expired'
    CANCELLED = 'cancelled', 'Cancelled'
    PAUSED = 'paused', 'Paused'

class EventAttendanceStatus(models.TextChoices):
    ATTENDING = 'attending', 'Attending'
    NOT_ATTENDING = 'not_attending', 'Not Attending'
    MAYBE = 'maybe', 'Maybe'
    NO_RESPONSE = 'no_response', 'No Response'

class JoinMethod(models.TextChoices):
    INVITE = 'invite', 'Invite'
    SELF = 'self', 'Self'
    APPLICATION = 'application', 'Application'
    UNKNOWN = 'unknown', 'Unknown'
    