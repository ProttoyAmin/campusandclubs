from core.policies.base import Policy
from apps.clubs.models import (
    Club,
    Visibility,
    Membership
)
from apps.accounts.models import User

class ClubPolicy(Policy[User, Club]):
    
    def can_view(self) -> bool:
        club = self.record

        if club.privacy == Visibility.PUBLIC: return True

        if not self.actor.is_authenticated:
            return False

        if self.actor.is_superuser:
            return True

        if club.owner == self.actor:
            return True
        

        # AVOID DB CALL. MOVE THE LOGIC TO REPO LAYER <- SERVICE <- POLICY
        
        if club.privacy == Visibility.PRIVATE:
            return Membership.objects.filter(user=self.actor, club=club).exists()

        return False


    # only owner can edit for now
     
    def can_edit(self) -> bool:
        return self.actor == self.record.owner

    def can_delete(self) -> bool:
        return self.actor == self.record.owner

