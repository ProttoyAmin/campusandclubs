import { useClubRequestsOutlet } from "@/features/club/context/club-requests-context";
import ApplicationCard from "@/features/club/components/club/application-card";
import type { ApplicationType } from "@/features/club/types/application";
import { ClubRequestsMenu } from "@/config/menu/club/reqeusts-menu";
import NavTabs from "@/components/nav-tabs";
import { useParams } from "react-router-dom";
import EmptyState from "@/shared/components/empty-state";

const ClubRequestsPage = () => {
  const { applications } = useClubRequestsOutlet();
  const params = useParams();

  return (
    <>
      <NavTabs
        menu={ClubRequestsMenu(params.slug!)}
        className="flex flex-col space-y-2"
      />
    </>
  );
};

export default ClubRequestsPage;
