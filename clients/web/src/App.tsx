import { useUsers } from "@/features/user/hooks/user.hooks";
import { useSession } from "./features/auth/hooks";
import { Link } from "react-router-dom";
import { paths } from "./settings/routes";
import { useGetClubs } from "./features/club/hooks/club.hooks";
import type { ClubDetail } from "@campus/api";

function App() {
  const { data: users } = useUsers();
  const { data: clubs } = useGetClubs();
  const { data } = useSession();

  return (
    <div>
      <p>{data.meta.is_authenticated ? "true" : "false"}</p>
      <div className="flex gap-4 w-full flex-wrap">
        {users?.data?.results.map((user) => (
          <Link key={user?.id} to={paths.private.user.profile(user.username)}>
            <p>{user.username}</p>
          </Link>
        ))}
      </div>
      <div className="flex gap-4 w-full flex-wrap">
        {clubs?.results.map((club: ClubDetail) => (
          <Link key={club?.id} to={paths.public.club.slug(club?.slug || "")}>
            <p>{club.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;
