from apps.clubs.serializer.invite.invite_serializers import UpdateInviteStatusSerializer
from apps.clubs.serializer.invite.invite_serializers import AcceptInviteInfoSerializer
from apps.clubs.serializer.invite.invite_serializers import AcceptInviteSerializer
from apps.clubs.services.invite_service import InviteService
from core.views import ServiceMixin
from apps.clubs.serializer.invite.invite_serializers import InviteCreateSerializer
from rest_framework import serializers
from apps.clubs.policies.club import ClubPolicy
from apps.clubs.policies.membership_policy import MembershipAwarePolicy
from core.views import PolicyMixin
from apps.clubs.models.enums import InviteStatus
from apps.clubs.models.enums import InviteType
from django.db.models import QuerySet
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.request import Request
from core import pagination
from apps.clubs.models import Invite
from apps.clubs.serializer.invite.invite_serializers import InviteSerializer, InviteListSerializer
from rest_framework import status
from rest_framework import response
from apps.clubs.models import Membership
from apps.clubs.models import Club
from rest_framework.generics import get_object_or_404
from rest_framework import permissions
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view



class ListInvitesAPIView(generics.GenericAPIView[Invite], PolicyMixin[ClubPolicy, Club], ServiceMixin[InviteService]):
    """
    List all club invitations
    Query params:
    - status: pending|accepted|declined|expired
    """
    pagination_class = pagination.StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    policy_class = ClubPolicy
    service_class = InviteService


    def get_queryset(self) -> QuerySet[Invite]:
        return Invite.objects.filter(
            invite_type=InviteType.CLUB,
            club=self.get_club()
        ).select_related('created_by', 'event', 'club')
    
    def get_serializer_class(self) -> type[serializers.Serializer]:
        if self.request.method == 'POST':
            return InviteCreateSerializer
        return InviteListSerializer

    def get_club(self) -> Club:
        return get_object_or_404(Club, id=self.kwargs['pk'], deleted_at__isnull=True)

    def get(self, request: Request, pk: str) -> Response:
        club = self.get_club()
        policy = self.get_policy(request, club).can_edit()

        if not policy.allowed:
            return Response(status=status.HTTP_403_FORBIDDEN, data={'detail': f'{policy.reason}'})
            
        paginated = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response(
            self.get_serializer(paginated, many=True).data
        )

    def post(self, request: Request, pk: str) -> Response:
        from apps.clubs.dtos.invite_dto import InviteAttrs

        club = self.get_club()
        policy = self.get_policy(request, club).can_edit()

        if not policy.allowed:
            return Response(status=status.HTTP_403_FORBIDDEN, data={'detail': f'{policy.reason}'})

        serializer = self.get_serializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        attrs = InviteAttrs(
            club_id=serializer.validated_data['club_id'],
            event_id=serializer.validated_data['event_id'],
            message=serializer.validated_data['message'],
            invite_type=serializer.validated_data['invite_type'],
        )
        
        invite = self.get_service(request).create(attrs)

        return Response(InviteListSerializer(instance=invite, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AcceptInviteAPIView(generics.GenericAPIView[Invite], PolicyMixin[ClubPolicy, Club], ServiceMixin[InviteService]):
    """
    Accept a club invitation
    """
    policy_class = ClubPolicy
    service_class = InviteService

    def get_serializer_class(self) -> type[serializers.Serializer]:
        if self.request.method == 'GET':
            return AcceptInviteInfoSerializer
        return AcceptInviteSerializer

    def get_permissions(self) -> list[permissions.BasePermission]:
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request: Request, pk: str, invite_code: str) -> Response:
        invite = self.get_service(request).get_by_code(invite_code)

        if invite.is_expired:
            return Response({
                'detail' : f"Expired invitation. Ask the admin to send a new one."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not request.user.is_authenticated:
            return Response({
                'detail' : f"You have been invited to join {invite.club.name} by {invite.created_by.username}",
                'action' : 'login',
                'data': self.get_serializer(instance=invite).data,
            }, status=status.HTTP_401_UNAUTHORIZED)

        policy = self.get_policy(request, invite.club)
        if policy.membership_exists():
            return Response({
                'detail' : f"You have already joined this club",
                'action' : 'already_joined',
                'data': self.get_serializer(instance=invite).data,
            }, status=status.HTTP_200_OK)

        return Response({
            'detail' : f"You have been invited to join {invite.club.name} by {invite.created_by.username}",
            'action' : 'accept',
            'data': self.get_serializer(instance=invite, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: str, invite_code: str) -> Response:
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        invite = self.get_service(request).accept_invite(serializer.validated_data['code'], request)
        return Response(AcceptInviteInfoSerializer(instance=invite, context={'request': request}).data, status=status.HTTP_200_OK)

class RetreiveInviteByCodeAPIView(generics.GenericAPIView[Invite], PolicyMixin[ClubPolicy, Club], ServiceMixin[InviteService]):
    permission_classes = [permissions.AllowAny]
    policy_class = ClubPolicy
    service_class = InviteService
    serializer_class = AcceptInviteInfoSerializer

    def get(self, request: Request, invite_code: str) -> Response:
        invite = self.get_service(request).get_by_code(invite_code)
        policy = self.get_policy(request, invite.club)

        if not request.user.is_authenticated:
            return Response({
                'detail' : f"You have been invited to join {invite.club.name} by {invite.created_by.username}",
                'action' : 'login',
                'data': self.get_serializer(instance=invite).data,
            }, status=status.HTTP_200_OK)

        if policy.membership_exists():
            return Response({
                'detail' : f"You have already joined this club",
                'action' : 'already_joined',
                'data': self.get_serializer(instance=invite, context={'request': request}).data,
            }, status=status.HTTP_200_OK)

        return Response({
            'detail' : f"You have been invited to join {invite.club.name} by {invite.created_by.username}",
            'action' : 'accept',
            'data': self.get_serializer(instance=invite, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

class UpdateInviteStatusAPIView(generics.GenericAPIView[Invite], PolicyMixin[ClubPolicy, Club], ServiceMixin[InviteService]):
    permission_classes = [permissions.IsAuthenticated]
    policy_class = ClubPolicy
    service_class = InviteService
    queryset = Invite.objects.all()

    def get_serializer_class(self) -> type[serializers.Serializer]:
        if self.request.method == 'GET':
            return AcceptInviteInfoSerializer
        return UpdateInviteStatusSerializer

    def patch(self, request: Request, pk: str, invite_code: str) -> Response:
        serializer = self.get_serializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        invite = self.get_service(request).update_invite_status(invite_code, InviteStatus(serializer.validated_data['status']))

        return Response(status=status.HTTP_200_OK)


class RemoveInviteAPIView(generics.GenericAPIView[Invite], PolicyMixin[ClubPolicy, Club], ServiceMixin[InviteService]):
    permission_classes = [permissions.IsAuthenticated]
    policy_class = ClubPolicy
    service_class = InviteService
    queryset = Invite.objects.all()

    def delete(self, request: Request, pk: str, invite_code: str) -> Response:
        invite = self.get_service(request).get_by_code(invite_code)
        policy = self.get_policy(request, invite.club).can_edit()

        if not policy.allowed:
            return Response(status=status.HTTP_403_FORBIDDEN, data={'detail': f'{policy.reason}'})

        self.get_service(request).remove_invite(invite_code)
        return Response(status=status.HTTP_204_NO_CONTENT)

# @api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated])
def list_club_invites(request, pk):
    """
    List all club invitations
    Query params:
    - status: pending|accepted|declined|expired
    """
    club = get_object_or_404(Club, id=pk, deleted_at__isnull=True)

    # Check permissions
    membership = Membership.objects.filter(
        user=request.user,
        club=club
    ).prefetch_related('roles').first()

    is_owner = club.owner == request.user

    can_view = False
    if is_owner:
        can_view = True
    elif membership:
        can_view = membership.has_permission('can_manage_members')

    if not can_view:
        return response.Response(
            {'detail': 'You don\'t have permission to view club invitations'},
            status=status.HTTP_403_FORBIDDEN
        )

    invites = Invite.objects.filter(
        invite_type='club',
        club=club
    ).select_related('inviter', 'invitee').order_by('-created_at')

    # Filter by status
    invite_status = request.query_params.get('status')
    if invite_status in ['pending', 'accepted', 'declined', 'expired']:
        invites = invites.filter(status=invite_status)

    paginator = pagination.StandardResultsSetPagination()
    paginated_invites = paginator.paginate_queryset(invites, request)

    serializer = InviteSerializer(
        paginated_invites,
        many=True,
        context={'request': request}
    )

    return paginator.get_paginated_response(serializer.data)