import { useUser } from '@/features/user/hooks/user.hooks';
import { useProfileOutlet } from '@/features/user/context/user-layout-context';
import PostCard, { type PostExtended } from '@/features/posts/components/post-card';
import type { Post } from '@campus/api';
import EmptyState from '@/shared/components/empty-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload01Icon } from '@hugeicons/core-free-icons';

const UserPosts = () => {
    const { user } = useProfileOutlet();
    const { posts } = useUser(user?.username, user?.id! as string)
    return (
        <>
            {posts.data?.results.length === 0 ? (
                <EmptyState
                    title=''
                    description='No posts'
                    icon={<HugeiconsIcon icon={Upload01Icon} className="size-6 text-gray-400" />}
                />
            ) : (
                posts.data?.results.map((post: Post) => (
                    <div key={post.id} className='grid grid-cols-1 p-0 min-h-fit'>
                        <PostCard post={post as PostExtended} />
                    </div>
                ))
            )}
        </>
    )
}

export default UserPosts