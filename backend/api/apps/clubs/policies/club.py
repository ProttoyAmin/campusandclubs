from pprint import pprint
from apps.clubs.dtos.decisions import JoinDecision, Decision, EditDecision
from core.policies.base import Policy
from apps.clubs.models import (
    Club,
    Visibility,
    Membership,
    JoinMode,
    MembershipScope,
    MembershipApplication,
    ApplicationStatus
    
    
)
from apps.accounts.models import User
from .membership_policy import MembershipAwarePolicy

class ClubPolicy(MembershipAwarePolicy[User, Club]):

    def get_membership(self) -> Membership | None:
        return Membership.objects.filter(user=self.actor, club=self.record).first()
    
    def can_view(self) -> Decision:
        club = self.record
        
        if self.actor.is_superuser:
            return Decision(True, "")

        if club.privacy == Visibility.PUBLIC: return Decision(True, "")

        if not self.actor.is_authenticated:
            return Decision(False, "You must be logged in to view this club.")


        if not club.owner == self.actor:
            return Decision(False, "You are not the owner of this club.")
        

        # AVOID DB CALL. MOVE THE LOGIC TO REPO LAYER <- SERVICE <- POLICY
        if club.privacy == Visibility.PRIVATE or club.privacy == Visibility.SECRET:
            return Decision(Membership.objects.filter(user=self.actor, club=club).exists(), "This is a private club and you're not a member.")
        

        return Decision(False, "You do not have permission to view this club.")


    # only owner can edit/delete for now
     
    def can_edit(self) -> Decision:
        return Decision(self.actor == self.record.owner, "Only club owners can edit the club")

    def can_delete(self) -> Decision:
        return Decision(self.actor == self.record.owner, "Only club owners can perform this action")

    def can_join(self) -> JoinDecision:
        club, actor = self.record, self.actor

        if not actor.is_authenticated:
            return JoinDecision(False, False, "You must be logged in to join a club.")

        if self._is_member(actor, club):
            return JoinDecision(False, False, "You are already a member of this club.")

        # SECRET clubs and invite-only clubs never allow self-service joining.
        if club.privacy == Visibility.SECRET or club.join_mode == JoinMode.INVITE_ONLY:
            return JoinDecision(False, False, "This club is invite-only. Ask an admin to invite you.")

        scope_ok, scope_reason = self._check_scope(actor, club)
        if not scope_ok:
            return JoinDecision(False, False, scope_reason)

        if club.join_mode == JoinMode.INSTANT:
            return JoinDecision(True, False, "You can join instantly.")

        if club.join_mode == JoinMode.APPLICATION:
            return JoinDecision(True, True, "This club is taking submissions to join. Submit an application from the url below to apply for membership.")

        return JoinDecision(False, False, "Joining is not currently available for this club.")


    def _check_scope(self, actor: User, club: Club) -> tuple[bool, str]:
        if club.scope == MembershipScope.GLOBAL:
            return True, ""

        if club.scope == MembershipScope.EXCLUSIVE:
            if not club.origin: return True, "This club has no origin institute."
            if getattr(actor, "institute_id", None) == club.origin.id:
                return True, ""
            return False, "This club is exclusive to members of a specific institute."

        if club.scope == MembershipScope.CROSS_INSTITUTE:
            if actor.institute_affiliations.exists():  # type: ignore
                return True, ""
            return False, "This club requires a verified institute affiliation."

        return False, "Unknown membership scope."

    def _is_member(self, actor: User, club: Club) -> bool:
        return Membership.objects.filter(user=actor, club=club).exists()

    def can_review_application(self) -> Decision:
        """Only members with can_manage_members may approve/reject."""
        membership = self.get_membership()
        if membership and membership.has_permission("can_manage_members"):
            return Decision(allowed=True, reason="")
        return Decision(allowed=False, reason="You don't have permission to review applications.")

    def can_withdraw(self, application: MembershipApplication, user: User) -> Decision:
        if application.applicant.id != user.id:
            return Decision(allowed=False, reason="This isn't your application.")
        if application.status != ApplicationStatus.PENDING:
            return Decision(allowed=False, reason="Only a pending application can be withdrawn.")
        return Decision(allowed=True, reason="")


