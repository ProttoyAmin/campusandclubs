import { useUsers } from "@/features/user/hooks/user.hooks";
import { useSession } from "./features/auth/hooks";
import { Link } from "react-router-dom";
import { paths } from "./settings/routes";
import { useGetClubs } from "./features/club/hooks/club.hooks";
import type { Club } from "@campus/api";
import Header from "./components/header";
import "./App.css";
import { useFeed } from "./features/posts/hooks/posts.hooks";
import PostCard from "./features/posts/components/post-card";
import type { PostExtended } from "./features/posts/components/post-card";
import { Card } from "design/components/ui/card";

function App() {
  const { data: users } = useUsers();
  const { data: clubs } = useGetClubs();
  const { data } = useSession();
  const { feed } = useFeed();

  return (
    <Card className="max-w-3xl md:ms-44 gap-0">
      <div className="md:hidden">
        <Header />
      </div>
      <p>{data?.meta?.is_authenticated ? "true" : "false"}</p>
      <div className="flex gap-4 w-full flex-wrap">
        {users?.data?.results.map((user) => (
          <Link key={user?.id} to={paths.private.user.profile(user.username)}>
            <p>{user.username}</p>
          </Link>
        ))}
      </div>
      <div className="flex gap-4 w-full flex-wrap">
        {clubs?.results.map((club: Club) => (
          <Link key={club?.id} to={paths.public.club.slug(club?.slug || "")}>
            <p>{club.name}</p>
          </Link>
        ))}
      </div>
      {feed?.data?.results.map((post: PostExtended) => (
        <div key={post.id} className="grid grid-cols-1 p-0 min-h-fit">
          <PostCard post={post} />
        </div>
      ))}
    </Card>
  );
}

export default App;