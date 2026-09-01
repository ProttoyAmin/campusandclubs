import type { UserProfile } from "@campus/api";
import type { PrivateUserResponse } from "../../api/user.client";
import { PrivateProfile } from "../../components/profile/private-profie";
import { PublicProfile } from "../../components/profile/public-profile";
import { useUserOutlet } from "../../context/user-layout-context";
import { Outlet } from "react-router-dom";

export type ProfileOutletContext = {
  user: UserProfile | PrivateUserResponse;
  currentUser: UserProfile | PrivateUserResponse;
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
    return <PrivateProfile data={user as PrivateUserResponse} />;
  }

  return <>
    <PublicProfile data={user as UserProfile} currentUser={currentUser as UserProfile} />
    <Outlet context={{ user: user, currentUser: currentUser }} />
  </>;
};

export default Profile;
