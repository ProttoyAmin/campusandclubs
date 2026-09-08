import React from 'react';
import EmptyState from '@/shared/components/empty-state';
import PostCard, { type PostExtended } from '@/features/posts/components/post-card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image03Icon } from '@hugeicons/core-free-icons';
import type { Post } from '@campus/api';
import { useFeed, useUser } from '@/features/user/hooks/user.hooks';
import { useParams } from 'react-router-dom';

const UserMedia = () => {
    const { username } = useParams()
    const { postsWithMedia } = useUser(username || '');
    return (
        <>
            {postsWithMedia?.data?.results?.length === 0 ? (
                <EmptyState
                    title=''
                    description='No media posts'
                    icon={<HugeiconsIcon icon={Image03Icon} className="size-6 text-gray-400" />}
                />
            ) : (
                <>
                    {postsWithMedia.data?.results?.map((post: PostExtended) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </>
            )}
        </>
    )
}

export default UserMedia