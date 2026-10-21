import React from 'react';
import { Button } from 'design/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Refresh03Icon, RefreshCcwDotIcon } from '@hugeicons/core-free-icons';
import type { PostExtended } from '@/features/posts/components/post-card';

type Props = {
    post: PostExtended
    onRepost?: (e: React.MouseEvent) => void
}

const Repost = ({ post, onRepost }: Props) => {
    const [isReposted, setIsReposted] = React.useState(false);
    const [repostCount, setRepostCount] = React.useState(post.repost_count);

    return (
        <div
            onClick={(e: React.MouseEvent) => {
                if (onRepost) {
                    onRepost(e);
                    return;
                }
                e.stopPropagation();
                const nextReposted = !isReposted;
                setIsReposted(nextReposted);
                setRepostCount(prev => prev + (nextReposted ? 1 : -1));
            }}
            className='w-12'
        >
            <Button
                variant="ghost"
                size="lg"
                className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50"
            >
                <HugeiconsIcon
                    icon={isReposted ? RefreshCcwDotIcon : Refresh03Icon}
                    className={`size-5 transition-transform duration-300 ${isReposted ? "rotate-180" : "rotate-0"
                        }`}
                />

                <span className="text-xs text-muted-foreground">
                    {repostCount}
                </span>
            </Button>
        </div>
    )
}

export default Repost