import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "design/components/ui/card";
import { useMe } from "@/features/user/hooks/user.hooks";
import { SettingsMenu } from "@/config/menu/settings-menu";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import ProfileLayoutHeader from "@/features/user/components/layout/layout-header";
import { useSession } from "@/features/auth/hooks";
import type { UserProfile } from "@campus/api";

export interface UserSettingsLayoutProps {
  me: UserProfile;
}

const SettingsLayout = () => {
  const { data: me } = useMe();
  const { data: currentUser } = useSession();
  const pageHeader = usePageHeader();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    document.title = "Settings | " + me?.username;
  }, [me]);

  React.useEffect(() => {
    pageHeader.setActions(
      <ProfileLayoutHeader user={me} currentUser={currentUser} />,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [
    me,
    navigate,
    location.pathname,
    pageHeader.setActions,
    pageHeader.clearActions,
  ]);

  if (!me) return <div>Not found</div>;

  return (
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
  );
};

export default SettingsLayout;
