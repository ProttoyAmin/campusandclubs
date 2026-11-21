import NavTabs from "@/components/nav-tabs";
import { AccountsMenu } from "@/config/menu/account-menu";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import NavigateButtons from "@/shared/components/navigate-buttons";
import Menu from "@/shared/components/menu";

const UserAccountPage = () => {
  const pageHeader = usePageHeader();

  React.useEffect(() => {
    const id = pageHeader.push(
        <div className="flex items-center gap-4">
          <NavigateButtons
            hideForward
          />
          <h1 className="text-lg font-semibold">Accounts</h1>
        </div>
    );

    return () => {
      pageHeader.pop(id)
    };
  }, [pageHeader.push, pageHeader.pop]);

  return (
    <>
    <Menu items={AccountsMenu()} />
      {/* <NavTabs
        menu={AccountsMenu()}
        className="flex flex-col"
      /> */}
    </>
  );
};

export default UserAccountPage;
