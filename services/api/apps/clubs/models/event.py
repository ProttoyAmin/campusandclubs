from typing import Any, Literal
from django.db import models
import uuid
from django.conf import settings

from apps.clubs.models import Club

class Event(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    club = models.ForeignKey(
        Club, on_delete=models.CASCADE, related_name='events')
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_events')
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='upcoming')
    max_participants = models.PositiveIntegerField(blank=True, null=True)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='club_events', blank=True)
    image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['club', 'start_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self) -> str:
        return f"{self.title} - {self.club.name}"

    @property
    def participant_count(self) -> int:
        return self.participants.count()

    @property
    def is_full(self) -> Any | Literal[False]:
        if self.max_participants:
            return self.participant_count >= self.max_participants
        return False
