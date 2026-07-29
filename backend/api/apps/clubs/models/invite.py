import uuid
from datetime import timedelta
from typing import Any
from django.db import models
from django.utils import timezone
from django.conf import settings

from apps.clubs.models import Membership

class Invite(models.Model):
    """
    Unified invitation model for both club memberships and event attendance.
    - Club invites: Users with can_manage_members can invite users to join a club
    - Event invites: Users with can_manage_events can invite members to attend an event
    """

    INVITE_TYPE_CHOICES = [
        ('club', 'Club Invitation'),
        ('event', 'Event Invitation'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    invite_type = models.CharField(
        max_length=10, choices=INVITE_TYPE_CHOICES)

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

    inviter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invites'
    )
    invitee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_invites'
    )

    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True)

    # Auto-expire after 7 days by default
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['club', 'status', 'created_at']),
            models.Index(fields=['event', 'status', 'created_at']),
            models.Index(fields=['invitee', 'status']),
            models.Index(fields=['inviter', 'created_at']),
        ]
        constraints = [
            # Ensure event is set for event invites
            # models.CheckConstraint(
            #     check=~models.Q(invite_type='event', event__isnull=True),
            #     name='event_invite_must_have_event'
            # ),
            # Only one pending club invite per user per club
            models.UniqueConstraint(
                fields=['club', 'invitee'],
                condition=models.Q(invite_type='club', status='pending'),
                name='unique_pending_club_invite'
            ),
            # Only one pending event invite per user per event
            models.UniqueConstraint(
                fields=['event', 'invitee'],
                condition=models.Q(invite_type='event', status='pending'),
                name='unique_pending_event_invite'
            ),
        ]
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Set expires_at to 7 days from now if not set
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def __str__(self):
        if self.invite_type == 'club':
            return f"{self.inviter.username} invited {self.invitee.username} to {self.club.name}"
        else:
            return f"{self.inviter.username} invited {self.invitee.username} to event {self.event.title}"

    @property
    def is_expired(self):
        """Check if the invitation has expired"""
        if self.status != 'pending':
            return False
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at

    def can_accept(self):
        """Check if the invitation can be accepted"""
        if self.status != 'pending':
            return False, "Invitation has already been responded to"

        if self.is_expired:
            self.status = 'expired'
            self.save()
            return False, "Invitation has expired"

        # For club invites, check if user is already a member
        if self.invite_type == 'club':
            if Membership.objects.filter(user=self.invitee, club=self.club).exists():
                return False, "User is already a member of this club"

        # For event invites, check if user is already attending
        if self.invite_type == 'event':
            # Note: EventAttendee model needs to be created if not exists
            pass

        return True, "Can accept"

    def accept(self):
        """Accept the invitation"""
        can_accept, message = self.can_accept()
        if not can_accept:
            return False, message

        if self.invite_type == 'club':
            # Create membership with default role
            default_role = self.club.roles.filter(is_default=True).first()
            membership = Membership.objects.create(
                user=self.invitee,
                club=self.club
            )
            if default_role:
                membership.add_role(default_role, set_as_primary=True)

        elif self.invite_type == 'event':
            # Add user to event participants
            self.event.participants.add(self.invitee)

        # Update invite status
        self.status = 'accepted'
        self.responded_at = timezone.now()
        self.save()

        return True, "Invitation accepted"

    def decline(self):
        """Decline the invitation"""
        if self.status != 'pending':
            return False, "Invitation has already been responded to"

        self.status = 'declined'
        self.responded_at = timezone.now()
        self.save()

        return True, "Invitation declined"

    def cancel(self):
        """Cancel the invitation (by inviter)"""
        if self.status != 'pending':
            return False, "Cannot cancel a responded invitation"

        self.status = 'expired'
        self.save()

        return True, "Invitation cancelled"
