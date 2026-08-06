import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../hooks/user.hooks";


const Profile: React.FC = () => {
  const username = useOutletContext<UserProfileLayoutProps>();
  const { data, error, isError } = useUser(username as unknown as string);
  console.log(data)

  if (!data) return <div>Not found</div>;

  return <div>
    <h1>{data?.username}</h1>
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </div>;
};

export default Profile;
