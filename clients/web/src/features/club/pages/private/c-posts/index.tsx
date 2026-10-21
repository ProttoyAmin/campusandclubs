import { useOutletContext } from "react-router-dom";
import { type ClubDetail } from "@campus/api";
import { useClubInfo } from "@/features/club/hooks/club.hooks";
import PostCard from "@/features/posts/components/post-card";
import { type PostExtended } from "@/features/posts/components/post-card";
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlbumNotFound02Icon } from "@hugeicons/core-free-icons";

const ClubPosts = () => {
    const { club } = useOutletContext<{ club: ClubDetail }>();
    const { posts } = useClubInfo(club?.id)

    return (
        <>
            <div className="grid grid-cols-1 p-0 min-h-fit">
                {posts?.data?.results?.length ? (
                    <>
                        {posts?.data?.results?.map((post: PostExtended) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </>
                ) : (
                    <>
                        <EmptyState
                            title=""
                            description="No posts yet"
                            icon={<HugeiconsIcon icon={AlbumNotFound02Icon} />}
                        />
                    </>
                )}
            </div>
        </>
    );
}

export default ClubPosts