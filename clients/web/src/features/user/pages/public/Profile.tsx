import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../hooks/user.hooks";
import { useSession } from "@/features/auth/hooks";

import type { UserProfile } from "@campus/api";
import type { PrivateUserResponse } from "../../api/user.client";
import { PrivateProfile } from "../../components/profile/private-profie";
import { PublicProfile } from "../../components/profile/public-profile";

function isPrivateUser(
  data: UserProfile | PrivateUserResponse,
): data is PrivateUserResponse {
  return data?.is_private;
}



const Profile: React.FC = () => {
  const username = useOutletContext<UserProfileLayoutProps>();
  const { data, error } = useUser(username as unknown as string);
  const { data: currentUser } = useSession();

  if (!data) return <div>Not found {error?.message}</div>;

  if (isPrivateUser(data)) {
    return <PrivateProfile data={data} />;
  }

  return <PublicProfile data={data} currentUser={currentUser} />;
};

export default Profile;
