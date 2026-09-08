import type { UserProfile } from "@campus/api";
import type { PrivateUserResponse } from "../../api/user.client";
import { PrivateProfileHeader } from "../../components/profile/private-profie";
import { PublicProfileHeader } from "../../components/profile/public-profile";
import { useUserOutlet } from "../../context/user-layout-context";
import { Outlet } from "react-router-dom";
import NavTabs from "@/components/nav-tabs";
import { profileMenu } from "@/config/menu/user/profile-menu";
import type { AuthSession } from "@/features/auth/services/authentication";

export type ProfileOutletContext = {
  user: UserProfile | PrivateUserResponse;
  currentUser: AuthSession;
}

function isPrivateUser(
  data: UserProfile | PrivateUserResponse,
): data is PrivateUserResponse {
  return data?.is_private;
}

const Profile: React.FC = () => {
  const { user, currentUser } = useUserOutlet();

  if (!user) return <div>Not found</div>;

  if (isPrivateUser(user)) {
    return (
      <div className="pt-4">
        <PrivateProfileHeader data={user as PrivateUserResponse} />
      </div>
    );
  }

  return <div className="pt-4">
    <PublicProfileHeader data={user as UserProfile} currentUser={currentUser} />
    <div className="p-2">
      <NavTabs menu={profileMenu(user?.username as string)} className="flex items-center" itemsClassName="justify-center" variant="tab" />
    </div>
    <Outlet context={{ user: user, currentUser: currentUser }} />
  </div>;
};

export default Profile;
