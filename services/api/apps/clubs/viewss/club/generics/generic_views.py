import stat
from django.db import transaction
from django.db.models import Q, Count, Prefetch, QuerySet
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from typing import Any

from core.pagination import StandardResultsSetPagination
from apps.clubs.serializer import ClubDetailSerializer
from apps.clubs.models import Club, Role, Membership
from apps.clubs.schema import club_list_schema

# Club List & Create Generic View
class ClubListCreateView(generics.ListCreateAPIView):
    queryset = Club.objects.all()
    serializer_class = ClubDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    @club_list_schema
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        List clubs visible to the authenticated user:
        - All public clubs
        - Closed/Secret clubs only if user is a member

        Query params:
        - search: Filter by name or origin
        - privacy: Filter by privacy type (public/closed/secret)
        - origin: Filter by specific origin
        - joined: Set to 'true' to only show clubs user is member of
        """

        user = request.user

        clubs = Club.objects.filter(is_active=True)

        joined = request.query_params.get('joined', '').lower() == 'true'

        if joined:
            clubs = clubs.filter(members=user)
        else:
            clubs = clubs.filter(
                Q(privacy='public') | Q(members=user)
            )

        search = request.query_params.get('search')

        if search:
            clubs = clubs.filter(
                Q(name__icontains=search) | 
                Q(origin__name__icontains=search) |
                Q(origin__country__icontains=search) |
                Q(origin__code__iexact=search)
            )

        privacy_filter = request.query_params.get('privacy')
        if privacy_filter in ['public', 'closed', 'secret']:
            clubs = clubs.filter(privacy=privacy_filter)

        origin_filter = request.query_params.get('origin')
        if origin_filter:
            clubs = clubs.filter(origin=origin_filter)

        clubs = clubs.distinct().annotate(
            member_count=Count('members', distinct=True),
            # post_count=Count('club.posts', distinct=True),
            event_count=Count('events', distinct=True),
        ).prefetch_related(
            Prefetch(
                'memberships',
                queryset=Membership.objects.filter(
                    user=request.user
                ).prefetch_related('roles'),
                to_attr='user_memberships'
            )
        ).select_related('owner').order_by('-created_at')

        page = self.paginate_queryset(clubs)
        serializer = self.get_serializer(page, many=True)

        return self.get_paginated_response(serializer.data)

    def perform_create(self, serializer) -> None:
        serializer.save(created_by=self.request.user)

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            club: Club = serializer.save(owner=request.user)

            admin_role = Role.objects.filter(club=club, name="Owner").first()
            if not admin_role:
                DEFAULT_ROLE = "Owner"
                DEFAULT_COLOR = "#8F2811"
                admin_role = Role.objects.create(
                    club=club,
                    name=DEFAULT_ROLE,
                    permissions={
                        'can_manage_members': True,
                        'can_manage_posts': True,
                        'can_manage_events': True,
                        'can_manage_settings': True
                    },
                    is_default=True,
                    color=DEFAULT_COLOR
                )

            membership = Membership.objects.create(
                user=request.user,
                club=club
            )

            membership.add_role(admin_role, set_as_primary=True)

        club = Club.objects.annotate(
            member_count=Count('members', distinct=True),
            # post_count=Count('club_posts', distinct=True),
            event_count=Count('events', distinct=True),
        ).prefetch_related(
            Prefetch(
                'memberships',
                queryset=Membership.objects.filter(
                    user=request.user
                ).prefetch_related('roles'),
                to_attr='user_memberships'
            )
        ).get(pk=club.pk)

        detail_serializer = self.get_serializer(club, context={
            'request': request
        })
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
