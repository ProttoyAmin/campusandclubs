import React from 'react';
import EmptyState from '@/shared/components/empty-state';
import PostCard from '@/features/posts/components/post-card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Refresh03Icon } from '@hugeicons/core-free-icons';
import type { Post } from '@campus/api';

const UserReposts = () => {
    const posts: Array<Post> = []
    return (
        <>
            {posts?.length === 0 ? (
                <EmptyState
                    title=''
                    description='No reposts.'
                    icon={<HugeiconsIcon icon={Refresh03Icon} className="size-6 text-gray-400" />}
                />
            ) : (
                <>
                    {posts?.map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </>
            )}
        </>
    )
}

export default UserReposts