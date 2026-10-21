from rest_framework.exceptions import ValidationError
import secrets
import uuid
from datetime import timedelta
from typing import Any
from django.db import models
from django.utils import timezone
from django.conf import settings

from apps.clubs.models import Membership
from apps.clubs.models.enums import InviteType, InviteStatus

def generate_code(length=8):
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


class Invite(models.Model):
    """
    Discord-style shareable invite.
    Can be used for:
      - Joining a Club
      - Attending an Event (even by non-members / outsiders)
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    invite_type = models.CharField(
        max_length=10, choices=InviteType)

    # For club invites (always required)
    club = models.ForeignKey(
        'Club',
        on_delete=models.CASCADE,
        related_name='invites'
    )

    # For event invites (optional, only when invite_type='event')
    event = models.ForeignKey(
        'Event',
        on_delete=models.CASCADE,
        related_name='invites',
        null=True,
        blank=True
    )

    code = models.CharField(
        max_length=16, 
        unique=True, 
        db_index=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_invites'
    )

    max_age = models.PositiveIntegerField(
        default=2592000,  # 30 days
        help_text="Seconds until expiry. 0 = never expires"
    )
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    uses = models.PositiveIntegerField(default=0)

    # TODO: auto-assign role when joining club via this invite
    # role = models.ForeignKey(
    #     'Role',
    #     on_delete=models.SET_NULL,
    #     null=True, blank=True,
    #     related_name='invites'
    # )

    status = models.CharField(
        max_length=10, choices=InviteStatus, default=InviteStatus.ONGOING)
    message = models.TextField(blank=True, null=True, default='')

    # Auto-expire after 7 days by default
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['club', 'status']),
            models.Index(fields=['event', 'status']),
            models.Index(fields=['invite_type', 'status', 'expires_at']),
        ]
        # constraints = [
        #     models.UniqueConstraint(
        #         fields=['club', 'status'],
        #         condition=models.Q(invite_type=InviteType.CLUB, status=InviteStatus.ONGOING),
        #         name='unique_pending_club_invite'
        #     ),
        #     # Only one pending event invite per user per event
        #     models.UniqueConstraint(
        #         fields=['event', 'status'],
        #         condition=models.Q(invite_type=InviteType.EVENT, status=InviteStatus.ONGOING),
        #         name='unique_pending_event_invite'
        #     ),
        # ]
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Set expires_at to 7 days from now if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)

        if not self.code:
            self.code = self.generate_code()

        super().save(*args, **kwargs)

    def __str__(self):
        if self.invite_type == InviteType.CLUB:
            return f"{self.created_by.username} created invite {self.code} for club {self.club.name}"
        else:
            return f"{self.created_by.username} created invite {self.code} for event {self.event.title}"

    @property
    def is_expired(self):
        """Check if the invitation has expired"""
        # if self.status == InviteStatus.ONGOING: 
        #     return False
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Check if the invitation is valid"""
        return not self.is_expired

    def revoke(self):
        self.status = InviteStatus.CANCELLED
        self.save(update_fields=['status'])

    def clean(self):
        if self.invite_type == InviteType.CLUB:
            if not self.club or self.event:
                raise ValidationError("Club invites must have a club and no event.")
        elif self.invite_type == InviteType.EVENT:
            if not self.event:
                raise ValidationError("Event invites must have an event.")

    def can_accept(self):
        """Check if the invitation can be accepted"""
        if self.status != InviteStatus.ONGOING:
            return False, "Invitation has already been responded to"

        if self.is_expired:
            self.status = InviteStatus.EXPIRED
            self.save()
            return False, "Invitation has expired"

        # For club invites, check if user is already a member
        if self.invite_type == InviteType.CLUB:
            if Membership.objects.filter(user=self.invitee, club=self.club).exists():
                return False, "User is already a member of this club"

        # For event invites, check if user is already attending
        if self.invite_type == InviteType.EVENT:
            # Note: EventAttendee model needs to be created if not exists
            pass

        return True, "Can accept"

    @staticmethod
    def generate_code(length=8):
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
        return ''.join(secrets.choice(alphabet) for _ in range(length))

class InviteUsage(models.Model):
    """
    Track individual uses of an invite link.
    Useful for analytics even if invite is reusable.
    """
    invite = models.ForeignKey(
        Invite, on_delete=models.CASCADE, related_name='usages')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invite_usages'
    )

    ip_address = models.CharField(max_length=45, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-used_at']
        unique_together = [['invite', 'user']]
        indexes = [
            models.Index(fields=['invite', 'used_at']),
            models.Index(fields=['user', 'used_at']),
        ]

    