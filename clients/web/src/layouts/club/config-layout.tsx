import { useEffect } from "react";
import { Outlet, matchPath, useLocation, useParams } from "react-router-dom";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import EmptyState from "@/shared/components/empty-state";
import NavTabs from "@/components/nav-tabs";
import { routes } from "@/settings/routes";

/**
 * Club configuration layout.
 *
 * Desktop (md+):
 *   Two-column layout — sticky sidebar on the left with Info/Roles/
 *   Requests/Members/Settings, child page fills the right pane.
 *
 * Mobile:
 *   - On the index /config/ route we render the full menu list (each item
 *     is a large tappable row). Navigating to a child route replaces the
 *     menu with that child page — no tabs shown inside the page, just
 *     like a native app; the header back button returns here.
 */
const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club, isPending } = useClub(slug);
  const location = useLocation();

  useEffect(() => {
    if (club?.name) document.title = `Manage ${club.name} • Clubs`;
  }, [club?.name]);

  if (isPending) return null;

  if (!club?.is_owner) {
    return (
      <EmptyState
        title="Not found"
        description="the page you are looking for doesn't exist"
      />
    );
  }

  const menu = clubConfigureMenu(slug!);

  // True when we are exactly on /config/ (the menu landing page).
  const isIndex =
    matchPath({ path: routes.club.private.config.base, end: true }, location.pathname) !== null;

  return (
    <>
      {/* ---------- Desktop: sidebar + content ---------- */}
      <div className="hidden md:flex md:flex-row md:gap-0 md:min-h-[calc(100vh-19rem)]">
        <aside className="w-64 shrink-0 border-r p-3">
          <NavTabs menu={menu} variant="nav" />
        </aside>
        <div className="flex-1 min-w-0 overflow-hidden p-4">
          <Outlet context={{ club }} />
        </div>
      </div>

      {/* ---------- Mobile: menu OR child page ---------- */}
      <div className="md:hidden px-3 pb-6">
        {isIndex ? (
          <div className="flex flex-col gap-2 pt-2">
            <h2 className="text-base font-semibold text-muted-foreground px-1 mb-1">Manage club</h2>
            <NavTabs menu={menu} variant="mobile" />
          </div>
        ) : (
          <div className="pt-2">
            <Outlet context={{ club }} />
          </div>
        )}
      </div>
    </>
  );
};

export default ClubConfigLayout;
