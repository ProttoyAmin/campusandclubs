import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "design/components/ui/card";
import { useMe } from "@/features/user/hooks/user.hooks";
import { SettingsMenu } from "@/config/menu/settings-menu";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import NavigateButtons from "@/shared/components/navigate-buttons";

const SettingsLayout = () => {
  const { data: me } = useMe();
  const pageHeader = usePageHeader();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    document.title = "Settings | " + me?.username;
  }, [me]);

  React.useEffect(() => {
    pageHeader.setActions(
      <div>
        <NavigateButtons
          disableForward={location.pathname === "/settings/account"}
          hideForward={location.pathname === "/settings/account"}
        />
      </div>,
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
    <div className="flex flex-col gap-4 max-w-5xl">
      <div className="flex justify-between items-center p-2">
        {pageHeader.actions}
      </div>
      <Card className="relative bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
        <CardContent className="flex gap-4">
          <div className="relative w-2/6 pr-4 border-r">
            <SideBar menu={SettingsMenu} className="sticky top-0 left-0" />
          </div>
          <div className="w-full overflow-hidden">
            <Outlet context={{ me }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsLayout;
