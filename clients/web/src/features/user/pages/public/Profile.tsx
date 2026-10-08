import type { UserProfile } from "@campus/api";
import type { PrivateUserResponse } from "../../api/user.client";
import { PrivateProfileHeader } from "../../components/profile/private-profie";
import { PublicProfileHeader, PublicProfileSkeleton } from "../../components/profile/public-profile";
import { useUserOutlet } from "../../context/user-layout-context";
import { Outlet } from "react-router-dom";
import NavTabs from "@/components/nav-tabs";
import { profileMenu } from "@/config/menu/user/profile-menu";
import type { AuthSession } from "@/features/auth/services/authentication";
import BottomBar from "@/components/bottom-bar";

export type ProfileOutletContext = {
  user: UserProfile | PrivateUserResponse;
  currentUser: AuthSession;
  isLoading: boolean;
}

function isPrivateUser(
  data: UserProfile | PrivateUserResponse,
): data is PrivateUserResponse {
  return data?.is_private && !data?.can_view_profile;
}

const Profile: React.FC = () => {
  const { user, currentUser, isLoading } = useUserOutlet();

  if (isLoading) {
    return (
      <>
        <PublicProfileSkeleton />
      </>
    )
  }

  if (!user) return <>
    Not found
  </>;

  if (isPrivateUser(user)) {
    return (
      <div className="pt-4">
        <PrivateProfileHeader data={user as PrivateUserResponse} />
      </div>
    );
  }

  return <div className="pt-4">
    <PublicProfileHeader data={user as UserProfile} currentUser={currentUser} isLoading={isLoading} />
    <div className="p-2">
      <NavTabs
        menu={profileMenu(user?.username as string)}
        className="flex justify-start w-full"
        itemsClassName="justify-start flex-1"
        variant="tab"
      />
    </div>
    <Outlet context={{ user: user, currentUser: currentUser, isLoading: isLoading }} />
    <div className="md:hidden fixed bottom-0 w-full z-50 h-12 bg-background">
      <BottomBar />
    </div>
  </div>;
};

export default Profile;
