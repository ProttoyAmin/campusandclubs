import React from 'react';
import { useUser } from '@/features/user/hooks/user.hooks';
import { useProfileOutlet } from '@/features/user/context/user-layout-context';

const UserPosts = () => {
    const { user } = useProfileOutlet();
    const { posts } = useUser(user?.username, user?.id! as string)
    return (
        <>
            <pre>{JSON.stringify(posts.data, null, 2)}</pre>
        </>
    )
}

export default UserPosts