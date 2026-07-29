from core.policies.base import Policy
from apps.accounts.models import User


class UserPolicy(Policy[User, User]):
    
    def can_view_profile(self, viewer: User) -> bool:
        """
        Check if viewer can view this user's profile
        Rules:
        1. Own profile - always yes
        2. Blocked - no
        3. Public profile - yes
        4. Private profile + follower - yes
        5. Private profile + not follower - no
        """
        # User can always view their own profile
        viewer, target = self.actor, self.record

        if viewer == target:
            return True

        # Handle anonymous users
        if not isinstance(viewer, User) or not viewer.is_authenticated:
            # Anonymous users can only view public profiles
            return not target.is_private

        if not getattr(viewer, "is_authenticated", False):
            return not target.is_private

        from apps.connections.models import Block
        if Block.has_blocked_each_other(target, viewer):
            return False

        if not target.is_private:
            return True

        from apps.connections.models import Follow
        return Follow.is_following(viewer, target)

    

    def can_view_posts(self, viewer: User) -> bool:
        """
        Check if viewer can view this user's posts
        Same logic as profile viewing
        """
        return self.can_view_profile(viewer)

