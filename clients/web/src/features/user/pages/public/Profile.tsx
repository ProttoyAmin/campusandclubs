import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUsers } from "../../hooks/user.hooks";


const Profile: React.FC = () => {
  const { username } = useOutletContext<UserProfileLayoutProps>();
  const { data } = useUsers();
  console.log(data)

  return <div>{username}</div>;
};

export default Profile;
