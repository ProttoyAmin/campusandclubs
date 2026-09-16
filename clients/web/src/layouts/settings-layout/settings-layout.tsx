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

export interface UserSettingsLayoutProps {
  me: UserProfile;
}

const SettingsLayout = () => {
  const { data: me } = useMe();
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

  return (
    <>
      {location.pathname === routes.settings.base ? (
        <>
          <section className="flex flex-col gap-4 max-w-3xl justify-around">
            <div className="flex items-center p-2">
              {pageHeader.actions ?? (
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-semibold">Settings</h1>
                </div>
              )}
            </div>
            <Card className="relative bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
              <CardContent className="w-full">
                <NavTabs
                  menu={SettingsMenu()}
                  className="flex flex-col space-y-2"
                />
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="flex flex-col gap-4 max-w-3xl justify-around">
            <div className="flex justify-between items-center p-2">
              {pageHeader.actions}
            </div>
            <Card className="relative bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
              <CardContent className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-2/6 pr-4 md:border-r">
                  <SideBar menu={SettingsMenu} className="sticky top-0 left-0" />
                </div>
                <div className="w-full overflow-hidden">
                  <Outlet context={{ me }} />
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </>
  );
};

export default SettingsLayout;
