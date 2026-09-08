import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useMembers } from "@/features/club/hooks/membership.hooks";
import MemberCard from "@/features/club/components/club/member-card";
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { UsersRoundIcon } from "@hugeicons/core-free-icons";

const ClubMembersPage = () => {
  const { club } = useClubOutlet();
  const { data } = useMembers(club?.id);
  return (
    <div className="grid gap-3 grid-cols-1 px-4">
      {data?.results?.members.length > 0 ? (
        data?.results?.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            showActions={club?.is_owner}
            variant="card"
          />
        ))
      ) : (
        <EmptyState title="No Members" description="No members joined yet" icon={<HugeiconsIcon icon={UsersRoundIcon} />} />
      )}
    </div>
  );
};

export default ClubMembersPage;
