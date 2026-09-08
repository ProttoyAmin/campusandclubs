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
      {/* <NavTabs
        menu={ClubRequestsMenu(club.slug)}
        className="flex flex-col space-y-2"
      /> */}
      <Outlet context={{ applications }} />
      {/* <CardHeader className="w-full">
        <Tabs
          defaultValue={
            location.pathname.includes("pending")
              ? "pending"
              : location.pathname.includes("approved")
                ? "approved"
                : location.pathname.includes("rejected")
                  ? "rejected"
                  : "all"
          }
        >
          <TabsList className={"bg-background"} variant="line">
            <TabsTrigger
              value="all"
              onClick={() =>
                navigate(paths.private.club.requests.base(club.slug))
              }
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              onClick={() =>
                navigate(paths.private.club.requests.pendings(club.slug))
              }
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              onClick={() =>
                navigate(paths.private.club.requests.approved(club.slug))
              }
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              onClick={() =>
                navigate(paths.private.club.requests.rejected(club.slug))
              }
            >
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="mt-4">
        <Outlet context={{ applications }} />
      </CardContent> */}
    </>
  );
};

export default ClubRequestsLayout;
