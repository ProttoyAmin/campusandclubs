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
import Create from "@/components/create";
import BottomBar from "./components/bottom-bar";
import { PostCardSkeleton } from "./features/posts/components/post-card";

function App() {
  const { data: users } = useUsers();
  const { data: clubs } = useGetClubs();
  const { data } = useSession();
  const { feed } = useFeed();

  return (
    <Card className="max-w-3xl h-screen mx-auto gap-0 overflow-y-auto bg-background scrollbar-none p-0">
      <div className="md:hidden">
        <Header />
      </div>
      {feed.isLoading ? <>
        {Array.from({ length: 6 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </> : <>
        {feed?.data?.results.map((post: PostExtended) => (
          <div key={post.id} className="grid grid-cols-1 p-0 min-h-fit">
            <PostCard post={post} />
          </div>
        ))}</>}
      <div className="md:hidden sticky bottom-0 w-full z-50 bg-background">
        <BottomBar />
      </div>
      <div className="absolute bottom-14 right-5 md:right-20">
        <Create />
      </div>
    </Card>
  );
}

export default App;