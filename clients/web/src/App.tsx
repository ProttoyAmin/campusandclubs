import { useUsers } from "@/features/user/hooks/user.hooks";
import { useSession } from "./features/auth/hooks";
import { Link } from "react-router-dom";
import { paths } from "./settings/routes";

function App() {
  const { data: users } = useUsers();
  const { data } = useSession();
  console.log(users);

  return (
    <div>
      <p>{data.meta.is_authenticated ? "true" : "false"}</p>
      <pre>{JSON.stringify(users?.data, null, 4)}</pre>
      {users?.data.results.map((user) => (
        <Link key={user?.id} to={paths.private.user.profile(user.username)}>
          {user.username}
        </Link>
      ))}
    </div>
  );
}

export default App;
