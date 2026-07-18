from typing import Any
from apps.accounts import models
from rest_framework import serializers

from core.policies.utils import current_user

from .club_membership import UserClubMembershipSerializer


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.User
        exclude = ['password']
        read_only_fields = ['last_active']


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile with club, post, and follow information"""
    # Personal info
    department = serializers.SerializerMethodField()
    
    # Institute info
    institute = serializers.CharField(
        source='institute.name', read_only=True)
    institute_id = serializers.CharField(
        source='institute.id', read_only=True
    )
    
    # Club stats
    club_count = serializers.SerializerMethodField()
    clubs = serializers.SerializerMethodField()
    clubs_url = serializers.SerializerMethodField()

    # Post stats
    user_post_count = serializers.IntegerField(read_only=True)
    club_post_count = serializers.SerializerMethodField()
    total_posts_count = serializers.IntegerField(read_only=True)
    posts_url = serializers.SerializerMethodField()

    # Follow stats
    follower_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    pending_requests_count = serializers.IntegerField(read_only=True)
    followers_url = serializers.SerializerMethodField()
    following_url = serializers.SerializerMethodField()

    # Current user's relationship with this user
    is_following = serializers.SerializerMethodField()
    is_followed_by = serializers.SerializerMethodField()
    is_mutual = serializers.SerializerMethodField()
    follow_status = serializers.SerializerMethodField()
    can_view_profile = serializers.SerializerMethodField()

    # Activity stats
    likes_given = serializers.IntegerField(
        source='total_likes_given', read_only=True)
    comments_made = serializers.IntegerField(
        source='total_comments_made', read_only=True)
    shares_made = serializers.IntegerField(
        source='total_shares_made', read_only=True)
    likes_received = serializers.IntegerField(
        source='total_likes_received', read_only=True)

    # URLs
    url = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()  # Alias for profile_picture_url

    class Meta:
        visible_fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'professional_email', 'url', 'gender', 'institute',
            'institute_id', 'student_id', 'department', 'year', 'level', 'type', 'preferred_email',
            'profile_picture_url', 'avatar', 'bio', 'location', 'website', 'date_of_birth',
            'email_verified', 'is_private', 'status', 'is_status_manual',
            'club_count', 'clubs', 'clubs_url',
            'user_post_count', 'club_post_count', 'total_posts_count', 'posts_url',
            'follower_count', 'following_count', 'pending_requests_count',
            'followers_url', 'following_url',
            'is_following', 'is_followed_by', 'is_mutual', 'follow_status', 'can_view_profile',
            'likes_given', 'comments_made', 'shares_made', 'likes_received',
            'last_active', 'created_at', 'updated_at', 'last_login'
        ]

        model = models.User
        fields = visible_fields
        read_only_fields = [
            'id', 'email', 'professional_email', 'email_verified',
            'created_at', 'updated_at', 'last_login'
        ]
    
    def __init__(self, *args: Any, **kwargs: Any):
        # Remove 'fields' from kwargs if present to avoid passing to super
        fields_param = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        
        # If fields_param is provided, use it
        if fields_param is not None:
            # Get the existing set of fields from the Meta class
            existing_fields = set(self.fields)
            
            # Determine the fields to be removed
            removable_fields = existing_fields - set(fields_param)
            
            # Remove fields not present in the 'fields' argument
            for field_name in removable_fields:
                self.fields.pop(field_name)
    
    def to_representation(self, instance: models.User) -> dict[str, Any] | dict[Any, Any]:
        """Optimize representation based on requested fields"""
        # Get requested fields from context
        requested_fields = self.context.get('fields')
        
        # If no specific fields requested, return full representation
        if not requested_fields:
            return super().to_representation(instance)
        
        # Build representation only for requested fields
        representation = {}
        
        # Use cached values where possible
        for field_name in requested_fields:
            if field_name in self.fields:
                try:
                    # Try to get from instance if it's a model field
                    if hasattr(instance, field_name):
                        value = getattr(instance, field_name)
                        representation[field_name] = value
                    else:
                        # Otherwise use the serializer field
                        field = self.fields[field_name]
                        representation[field_name] = field.get_attribute(instance)
                except Exception:
                    # Fallback to serializer method
                    field = self.fields.get(field_name)
                    if field and hasattr(field, 'get_attribute'):
                        representation[field_name] = field.get_attribute(instance)
        
        return representation

    def update(self, instance: models.User, validated_data):
        # If status is being updated, it's a manual change
        if 'status' in validated_data:
            instance.is_status_manual = True
            # Special case: if manually setting to online, we actually clear manual flag
            # as per the user's request that online should always go to away on leave.
            if validated_data['status'] == 'online':
                instance.is_status_manual = False

        return super().update(instance, validated_data)

    # Helper method to check if field should be included
    def _should_include(self, field_name: str):
        """Check if a field should be included in the response"""
        requested_fields = self.context.get('fields')
        if not requested_fields:
            return True
        return field_name in requested_fields

    def get_avatar(self, obj: models.User):
        """Alias for profile_picture_url"""
        return self.get_profile_picture_url(obj)

    def get_profile_picture_url(self, obj: models.User):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar)
        return None

    def get_url(self, obj: models.User):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/accounts/auth/{obj.id}/')
        return None
    
    def get_department(self, obj: models.User):
        if obj.department:
            return obj.department.code
        return None

    def get_clubs_url(self, obj: models.User):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/accounts/auth/{obj.id}/clubs/')
        return None

    def get_posts_url(self, obj: models.User):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/accounts/auth/{obj.id}/posts/')
        return None

    def get_followers_url(self, obj: models.User):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/connections/{obj.id}/followers/')
        return None

    def get_following_url(self, obj: models.User):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/v1/connections/{obj.id}/following/')
        return None

    def get_clubs(self, obj: models.User):
        """Return lightweight club info - only if requested"""
        if not self._should_include('clubs'):
            return []
            
        from apps.clubs.models import Membership
        memberships = Membership.objects.filter(
            user=obj).select_related('club').prefetch_related('roles')
        return UserClubMembershipSerializer(
            memberships,
            many=True,
            context=self.context
        ).data

    def get_club_count(self, obj: models.User) -> int:
        """Get club count from property"""
        return obj.club_count if hasattr(obj, 'club_count') else 0

    def get_club_post_count(self, obj: models.User) -> int:
        return obj.get_club_posts_count() if hasattr(obj, 'get_club_posts_count') else 0

    def get_is_following(self, obj: models.User) -> bool | None:
        """Is current user following this user?"""
        if not self._should_include('is_following'):
            return None
            
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user != obj:
            return obj.is_followed_by(request.user) if hasattr(obj, 'is_followed_by') else False
        return False

    def get_is_followed_by(self, obj: models.User) -> bool | None:
        """Is this user following current user?"""
        if not self._should_include('is_followed_by'):
            return None
            
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user != obj:
            return obj.is_following(request.user) if hasattr(obj, 'is_following') else False
        return False

    def get_is_mutual(self, obj: models.User) -> bool | None:
        """Are they mutual followers?"""
        if not self._should_include('is_mutual'):
            return None
            
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user != obj:
            return obj.are_mutual_followers(request.user) if hasattr(obj, 'are_mutual_followers') else False
        return False

    def get_follow_status(self, obj: models.User) -> Any | None:
        """Get follow status (pending, accepted, None)"""
        if not self._should_include('follow_status'):
            return None
            
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user != obj:
            from apps.connections.models import Follow
            return Follow.get_follow_status(request.user, obj) if hasattr(Follow, 'get_follow_status') else None
        return None

    def get_can_view_profile(self, obj: models.User) -> bool:
        """Can current user view this profile?"""
        from apps.accounts.policies.user import UserPolicy
        request = self.context.get('request')
        if request:
            if request.user.is_authenticated:
                policy = UserPolicy(current_user(request), obj)
                return policy.view(viewer=request.user) if hasattr(policy, 'view') else True
            else:
                # Anonymous users - only public profiles
                return not obj.is_private if hasattr(obj, 'is_private') else True
        return not obj.is_private if hasattr(obj, 'is_private') else True
