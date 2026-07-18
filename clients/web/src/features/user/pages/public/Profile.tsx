import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";

const Profile: React.FC = () => {
  const { username } = useOutletContext<UserProfileLayoutProps>();

  return <div>{username}</div>;
};

export default Profile;
