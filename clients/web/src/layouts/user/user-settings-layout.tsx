import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { CardContent } from "design/components/ui/card";
import { useUser } from "@/features/user/hooks/user.hooks";
import { userSettingsMenu } from "@/config/menu/user/settings-menu";

const UserSettingsLayout = () => {
  const params = useParams();
  const { user } = useUser(params.username);
  return (
    <CardContent className="flex w-full gap-4">
      <div className="relative w-2/6 border-r pr-4">
        <SideBar
          menu={userSettingsMenu}
          menuParam={params.username}
          className="sticky top-0 left-0"
        />
      </div>
      <div className="w-3/5 overflow-hidden">
        <Outlet context={{ user: user.data }} />
      </div>
    </CardContent>
  );
};

export default UserSettingsLayout;
