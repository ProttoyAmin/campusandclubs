import { usePost } from '@/features/posts/hooks/posts.hooks';
import { FavouriteIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from 'design/components/ui/button';
import React from 'react'
import type { PostExtended } from '@/features/posts/components/post-card';
import { queryClient } from '@/config/query-client';

type Props = {
    post: PostExtended
    onLike?: (e: React.MouseEvent) => void
}

const Like = ({ post, onLike }: Props) => {
    const [liked, setLiked] = React.useState<boolean>(!!post.is_liked);
    const [count, setCount] = React.useState<number>(Number(post.like_count))
    const { toggleLike } = usePost(post.id);

    return (
        <div onClick={(e: React.MouseEvent) => {
            if (onLike) {
                onLike(e);
                return;
            }
            e.stopPropagation();
            const nextLiked = !liked;

            setLiked(nextLiked);
            setCount(prev => prev + (nextLiked ? 1 : -1));
            toggleLike.mutate(undefined, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["users", post.author?.username, 'posts'] });
                },
                onError: () => {
                    setLiked(prev => !prev);
                    setCount((prev) => prev + (nextLiked ? -1 : 1));
                }
            });
        }} className='w-12'>
            <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                <HugeiconsIcon icon={FavouriteIcon} className={`size-5 ${liked ? 'text-red-500' : 'text-muted-foreground'}`} fill={liked ? 'red' : 'none'} />
                <span className={`text-xs text-muted-foreground ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {count}
                </span>
            </Button>
        </div>
    )
}

export default Like