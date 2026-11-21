import { Outlet, useLocation } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "design/components/ui/card";
import { useMe } from "@/features/user/hooks/user.hooks";
import { SettingsMenu } from "@/config/menu/settings-menu";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import type { UserProfile } from "@campus/api";
import { routes } from "@/settings/routes";
import NavTabs from "@/components/nav-tabs";
import { APP_NAME } from "@/config/constants";
import NavigateButtons from "@/shared/components/navigate-buttons";
import Menu from "@/shared/components/menu";
import { useIsMobile } from "design/hooks/use-mobile";
import BottomBar from "@/components/bottom-bar";

export interface UserSettingsLayoutProps {
  me: UserProfile;
}

const SettingsLayout = () => {
  const { data: me } = useMe();
  const isMobile = useIsMobile()
  const pageHeader = usePageHeader();
  const location = useLocation();

  React.useEffect(() => {
    if (!me) {
      document.title = `Settings • ${APP_NAME}`;
      return;
    }
    document.title = `Settings • (@${me.username}) • ${APP_NAME}`;
  }, [me]);

  if (!me) return <div>Not found</div>;

  if (isMobile) {
    return (
      <>
        {location.pathname === routes.settings.base ? (
          <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto w-full">
            <div className="flex items-center p-2">
              {pageHeader.actions ?? (
                <div className="flex items-center gap-4">
                  <NavigateButtons className="md:hidden" hideForward />
                  <h1 className="text-lg font-semibold">Settings</h1>
                </div>
              )}
            </div>
            <div className="p-2">
              <Menu items={SettingsMenu()} />
            </div>
            <div className="md:hidden fixed bottom-0 w-full z-50 h-10 bg-background">
              <BottomBar />
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto w-full">
              <div className="flex justify-between items-center p-2">
                {pageHeader.actions}
              </div>
              <div className="relative bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full overflow-hidden px-4">
                    <Outlet context={{ me }} />
                  </div>
                </div>
              </div>
              <div className="md:hidden fixed bottom-0 w-full z-50 h-10 bg-background">
                <BottomBar />
              </div>
            </section>
          </>
        )}
      </>
    )
  }

  return (
    <>
      {location.pathname === routes.settings.base ? (
        <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto w-full">
          <div className="flex items-center p-2">
            {pageHeader.actions ?? (
              <div className="flex items-center gap-4">
                <NavigateButtons className="md:hidden" hideForward />
                <h1 className="text-lg font-semibold">Settings</h1>
              </div>
            )}
          </div>
          <div className="p-2">
            <Menu items={SettingsMenu()} />
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto w-full">
            <div className="flex justify-between items-center p-2">
              {pageHeader.actions}
            </div>
            <div className="relative bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-2/6 pr-4 md:border-r h-screen max-h-[calc(100vh-5rem)]">
                  {<SideBar menu={SettingsMenu} className="sticky top-0 left-0" />}
                </div>
                <div className="w-full overflow-hidden px-4">
                  <Outlet context={{ me }} />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default SettingsLayout;
