import { Outlet } from "react-router-dom";
import { useApplications } from "@/features/club/hooks/applications.hooks";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import NavTabs from "@/components/nav-tabs";
import { ClubRequestsMenu } from "@/config/menu/club/reqeusts-menu";

const ClubRequestsLayout = () => {
  const { club } = useClubOutlet();
  const { data: applications } = useApplications(club?.id);

  if (!club) return null;

  return (
    <>
      <NavTabs
        menu={ClubRequestsMenu(club.slug)}
        className="flex flex-col space-y-2"
      />
      <Outlet context={{ applications }} />
    </>
  );
};

export default ClubRequestsLayout;
