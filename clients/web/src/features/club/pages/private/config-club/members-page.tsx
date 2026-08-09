import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useMembers } from "@/features/club/hooks/membership.hooks";

const ClubMembersPage = () => {
  const { club } = useClubOutlet();
  const { data } = useMembers(club?.id);
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ClubMembersPage;
