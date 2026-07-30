import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../hooks/user.hooks";
import { useParams } from "react-router-dom";


const Profile: React.FC = () => {
  const params = useParams()
  const username = useOutletContext<UserProfileLayoutProps>();
  console.log("params", params)
  const { data } = useUser(params.username);
  console.log("DATA: ", data)

  return <div>
    {params.username}
    <pre>{JSON.stringify(data, null, 4)}</pre>
  </div>;
};

export default Profile;
