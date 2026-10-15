from apps.clubs.models.enums import InviteStatus
from apps.clubs.models import InviteUsage
from apps.clubs.serializer import ClubMinimalSerializer
from apps.accounts.serialize.user.profile import UserMinimalSerializer
from apps.clubs.models import Event
from apps.clubs.models import Club
from rest_framework import serializers
from apps.clubs.models import Invite, Membership
from apps.clubs.models.enums import InviteType
from django.utils import timezone
class InviteListSerializer(serializers.ModelSerializer):
    link = serializers.SerializerMethodField(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    usages = serializers.SerializerMethodField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invite
        exclude = []

    def get_link(self, obj: Invite):
        from django.conf import settings

        url = settings.FRONTEND_URL
        return f'{url}/invitation/{obj.code}'

    def get_usages(self, obj: Invite):
        usages: InviteUsage = obj.usages.all()

        return [{
            'id': usage.id,
            'user': UserMinimalSerializer(usage.user).data,
            'used_at': usage.used_at,
            'ip_address': usage.ip_address,
            'user_agent': usage.user_agent,
        } for usage in usages]

    def get_is_expired(self, obj: Invite):
        return obj.expires_at < timezone.now()

class AcceptInviteSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=255, required=True)

class UpdateInviteStatusSerializer(serializers.ModelSerializer):
    # status = serializers.ChoiceField(choices=InviteStatus.values)
    status = serializers.CharField()
    
    class Meta:
        model = Invite
        fields = ['status']

class AcceptInviteInfoSerializer(serializers.ModelSerializer):
    club = ClubMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    class Meta:
        model = Invite
        fields = [
            'id',
            'invite_type',
            'club',
            'created_by',
        ]

class InviteCreateSerializer(serializers.Serializer):
    invite_type = serializers.ChoiceField(InviteType)
    club_id = serializers.UUIDField()
    event_id = serializers.UUIDField(allow_null=True, required=False, default=None)
    message = serializers.CharField(max_length=255, required=False, allow_null=True, default=None)

    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     request = self.context.get('request')
    #     user = request.user
    #     club = request.parser_context.get('kwargs').get('pk')
    #     self.fields['club'].queryset = Club.objects.filter(id=club)
    #     self.fields['event'].queryset = Event.objects.filter(club=club,)

class InviteSerializer(serializers.ModelSerializer):
    """Serializer for club and event invitations"""
    inviter_details = serializers.SerializerMethodField()
    invitee_details = serializers.SerializerMethodField()
    club_name = serializers.CharField(source='club.name', read_only=True)
    event_title = serializers.CharField(
        source='event.title', read_only=True, allow_null=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invite
        fields = [
            'id', 'invite_type', 'club', 'club_name', 'event', 'event_title',
            'inviter', 'inviter_details', 'invitee', 'invitee_details',
            'status', 'message', 'expires_at', 'created_at', 'responded_at',
            'is_expired'
        ]
        read_only_fields = ['id', 'status',
                            'responded_at', 'created_at', 'expires_at']

    def get_inviter_details(self, obj):
        return {
            'id': obj.inviter.id,
            'username': obj.inviter.username,
            'profile_picture': obj.inviter.profile_picture.url if obj.inviter.profile_picture else None,
        }

    def get_invitee_details(self, obj):
        return {
            'id': obj.invitee.id,
            'username': obj.invitee.username,
            'profile_picture': obj.invitee.profile_picture.url if obj.invitee.profile_picture else None,
        }

    def validate(self, attrs):
        """Validate invite attrs"""
        request = self.context.get('request')
        invite_type = attrs.get('invite_type')
        club = attrs.get('club')
        event = attrs.get('event')
        invitee = attrs.get('invitee')

        # Validate that event is provided for event invites
        if invite_type == 'event' and not event:
            raise serializers.ValidationError(
                "Event must be specified for event invitations"
            )

        # Check if inviter has permission
        if request and request.user:
            membership = Membership.objects.filter(
                user=request.user,
                club=club
            ).prefetch_related('roles').first()

            if not membership:
                raise serializers.ValidationError(
                    "You must be a member of this club to send invitations"
                )

            if invite_type == 'club':
                if not membership.has_permission('can_manage_members'):
                    raise serializers.ValidationError(
                        "You don't have permission to invite members to this club"
                    )
            elif invite_type == 'event':
                if not membership.has_permission('can_manage_events'):
                    raise serializers.ValidationError(
                        "You don't have permission to send event invitations"
                    )

        # Check if user is already a member (for club invites)
        if invite_type == 'club':
            if Membership.objects.filter(user=invitee, club=club).exists():
                raise serializers.ValidationError(
                    f"{invitee.username} is already a member of {club.name}"
                )

        # Check if user is already attending (for event invites)
        if invite_type == 'event' and event:
            if event.participants.filter(id=invitee.id).exists():
                raise serializers.ValidationError(
                    f"{invitee.username} is already attending this event"
                )

        # Check for duplicate pending invites
        existing_invite = Invite.objects.filter(
            club=club,
            invitee=invitee,
            status='pending'
        )
        if invite_type == 'event' and event:
            existing_invite = existing_invite.filter(event=event)

        if existing_invite.exists():
            raise serializers.ValidationError(
                "A pending invitation already exists for this user"
            )

        return attrs