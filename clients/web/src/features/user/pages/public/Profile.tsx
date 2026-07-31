import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../hooks/user.hooks";


const Profile: React.FC = () => {
  const username = useOutletContext<UserProfileLayoutProps>();
  const { data } = useUser(username as unknown as string);

  return <div>
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </div>;
};

export default Profile;
