import { Outlet, useLocation } from "react-router-dom";
import { CardHeader, CardContent } from "design/components/ui/card";

import { Tabs, TabsList, TabsTrigger } from "design/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import { useApplications } from "@/features/club/hooks/applications.hooks";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import NavTabs from "@/components/nav-tabs";
import { SettingsMenu } from "@/config/menu/settings-menu";
import { ClubRequestsMenu } from "@/config/menu/club/reqeusts-menu";

const ClubRequestsLayout = () => {
  const { club } = useClubOutlet();
  const { data: applications } = useApplications(club?.id);
  const navigate = useNavigate();
  const location = useLocation();

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
