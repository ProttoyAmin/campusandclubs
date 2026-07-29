


# from rest_framework import (
#     permissions,
#     viewsets,
#     mixins
# )
# from rest_framework.decorators import action


# from core.pagination import StandardResultsSetPagination
# from apps.accounts.models import User
# from apps.accounts.serialize.user import UserProfileSerializer


# class UserViewSet(viewsets.GenericViewSet,
#                   mixins.RetrieveModelMixin,
#                   mixins.UpdateModelMixin,
#                   mixins.ListModelMixin):
#     """User ViewSet with extended functionality"""
#     queryset = User.objects.all()
#     serializer_class = UserProfileSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly]
#     pagination_class = StandardResultsSetPagination

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context['request'] = self.request
#         return context

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
#     def clubs(self, request, pk=None):
#         """Get user's clubs"""
#         user = self.get_object()
#         return get_user_clubs(request, user.id)

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
#     def posts(self, request, pk=None):
#         """Get user's posts"""
#         user = self.get_object()
#         return get_user_posts(request, user.id)

#     @action(detail=True, methods=['GET'], permission_classes=[permissions.IsAuthenticated])
#     def roles(self, request, pk=None):
#         """Get all roles for user across clubs"""
#         user = self.get_object()
#         return get_all_user_roles(request, user.id)

#     @action(detail=True, methods=['GET'], url_path=r'roles/(?P<club_id>\d+)')
#     def club_roles(self, request, pk=None, club_id=None):
#         """Get user's roles in a specific club"""
#         user = self.get_object()
#         return get_user_roles_in_club(request, user.id, club_id)
