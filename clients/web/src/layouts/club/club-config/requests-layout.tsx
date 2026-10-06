import { Outlet, matchPath, useLocation, useParams } from "react-router-dom";
import { useApplications } from "@/features/club/hooks/applications.hooks";
import { useClub } from "@/features/club/hooks/club.hooks";
import NavTabs from "@/components/nav-tabs";
import { ClubRequestsMenu } from "@/config/menu/club/reqeusts-menu";
import { routes } from "@/settings/routes";

/**
 * Requests sub-section (Pending/Approved/Rejected).
 *
 * Desktop: a secondary sidebar inside the config layout's content area.
 * Mobile: at /config/requests/ we show a menu list of the three tabs;
 * child pages (pending/approved/rejected) fill the screen and the
 * header's back button returns to the menu.
 */
const ClubRequestsLayout = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { data: club } = useClub(slug);
  const { data: applications } = useApplications(club?.id);
  const menu = ClubRequestsMenu(slug!);

  const isIndex =
    matchPath(
      { path: routes.club.private.config.requests.base, end: true },
      location.pathname,
    ) !== null;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:flex-row md:gap-0 w-full min-h-[40vh]">
        <aside className="w-52 shrink-0 pr-4 border-r">
          <NavTabs menu={menu} variant="nav" />
        </aside>
        <div className="flex-1 min-w-0 pl-4 overflow-hidden">
          <Outlet context={{ applications }} />
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        {isIndex ? (
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-1">Requests</h3>
            <NavTabs menu={menu} variant="mobile" />
          </div>
        ) : (
          <Outlet context={{ applications }} />
        )}
      </div>
    </>
  );
};

export default ClubRequestsLayout;
