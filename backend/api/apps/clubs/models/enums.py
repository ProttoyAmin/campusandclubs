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
    GLOBAL = 'global', 'Global'
    EXCLUSIVE = 'exclusive', 'Exclusive'
    CROSS_INSTITUTE = 'cross_institute', 'Cross Institute'
