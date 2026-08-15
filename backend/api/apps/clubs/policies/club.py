from pprint import pprint
from apps.clubs.dtos.decisions import JoinDecision, Decision, LeaveDecision
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

    def membership_exists(self) -> bool:
        return Membership.objects.filter(user=self.actor, club=self.record).exists()
    
    def can_view(self) -> Decision:
        club = self.record
        
        if self.actor.is_superuser:
            return Decision(True, "")

        if club.privacy == Visibility.PUBLIC: return Decision(True, "")

        if not self.actor.is_authenticated:
            return Decision(False, "You must be logged in to view this club.")


        # if not club.owner == self.actor:
        #     return Decision(False, "You are not the owner of this club.")
        

        # TODO: AVOID DB CALL. MOVE THE LOGIC TO REPO LAYER <- SERVICE <- POLICY
        if club.privacy == Visibility.PRIVATE:
            return Decision(Membership.objects.filter(user=self.actor, club=club).exists(), "This is a private club and you're not a member.")
        

        return Decision(False, "You do not have permission to view this club.")


    # only owner can edit/delete for now
     
    def can_edit(self) -> Decision:
        return Decision(self.actor == self.record.owner, "Only club owners can edit the club")

    def can_delete(self) -> Decision:
        return Decision(self.actor == self.record.owner, "Only club owners can perform this action")

    def can_join(self) -> JoinDecision:
        club, actor = self.record, self.actor

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

    def can_leave(self) -> LeaveDecision:
        if not self._is_member(self.actor, self.record):
            return LeaveDecision(allowed=False, reason={
                "code": "not_a_member",
                "message": "You are not a member of this club."
            })

        if self.actor == self.record.owner:
            return LeaveDecision(allowed=False, reason={
                "code": "is_owner",
                "message": "Club owners cannot leave their own clubs. Transfer ownership or delete the club instead."
            })

        if self._has_active_permissions(self.actor, self.record):
            return LeaveDecision(allowed=False, reason={
                "code": "has_permissioned_roles",
                "message": "You cannot leave with roles assigned to this club. Ask the owner to remove the assigned roles."
            })

        
        return LeaveDecision(True, {})

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
        return Membership.objects.filter(user=actor, club=club, left_at__isnull=True).exists()

    def _has_active_permissions(self, actor, club) -> bool:
        membership = Membership.objects.filter(
            club=club, user=actor, left_at__isnull=True
        ).prefetch_related("roles").first()

        if not membership:
            return False

        return bool(membership.user_permissions())

    def can_review_application(self) -> Decision:
        """Only members with manage:members permission may approve/reject."""
        if self.actor == self.record.owner:
            return Decision(allowed=True, reason="")

        if not self.membership_exists():
            return Decision(allowed=False, reason="You are not a member of this club.")

        membership = self.get_membership()
        if membership and membership.has_permission("manage:members"):
            return Decision(allowed=True, reason="")
        return Decision(allowed=False, reason="You don't have permission to review applications.")

    def can_create_application(self) -> Decision:
        if self.membership_exists():
            return Decision(allowed=False, reason="You are already a member of this club.")

        membership = self.get_membership()
        if membership and membership.has_permission("manage:members"):
            return Decision(allowed=True, reason="")
        return Decision(allowed=False, reason="You don't have permission to create applications.")
        

    def can_withdraw(self, application: MembershipApplication, user: User) -> Decision:
        if application.applicant.id != user.id:
            return Decision(allowed=False, reason="This isn't your application.")
        if application.status != ApplicationStatus.PENDING:
            return Decision(allowed=False, reason="Only a pending application can be withdrawn.")
        return Decision(allowed=True, reason="")


