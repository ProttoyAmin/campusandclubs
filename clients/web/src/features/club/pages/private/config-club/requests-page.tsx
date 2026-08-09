import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useApplications } from "@/features/club/hooks/applications.hooks";

const ClubRequestsPage = () => {
  const { club } = useClubOutlet();
  const { data } = useApplications(club?.id);
  
  return <div>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>;
};

export default ClubRequestsPage;
