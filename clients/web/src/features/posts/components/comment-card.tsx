import { Button } from 'design/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from 'design/components/ui/avatar';
import type { Comment } from '@/types/comment';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, MessageCircleIcon, Refresh03Icon, SendIcon } from '@hugeicons/core-free-icons';

const CommentCard = ({ comment }: { comment: Comment }) => {
    return (
        <div className='flex flex-row items-center gap-2'>
            <div className='flex flex-col items-center justify-center'>
                <Avatar className='w-10 h-10'>
                    <AvatarImage src={comment.author_avatar} />
                    <AvatarFallback>{comment.author_username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
            <div className='flex flex-col gap-1'>
                <div>{comment.author_username}</div>
                <div className="">{comment.content}</div>
                <div className="flex items-center">
                    <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full">
                        <HugeiconsIcon icon={FavouriteIcon} className="size-5 text-red-500" fill="red" />
                        <span className="text-xs text-muted-foreground">
                            {comment.like_count}
                        </span>
                    </Button>
                    <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full">
                        <HugeiconsIcon icon={MessageCircleIcon} className="size-5" />
                        <span className="text-xs text-muted-foreground">
                            {comment.reply_count}
                        </span>
                    </Button>
                    <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full">
                        <HugeiconsIcon
                            icon={Refresh03Icon}
                            className="size-5"
                        />
                        <span className="text-xs text-muted-foreground">
                            {comment.reply_count}
                        </span>
                    </Button>
                    <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full">
                        <HugeiconsIcon icon={SendIcon} className="size-5" />
                        <span className="text-xs text-muted-foreground">
                            {comment.like_count}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CommentCard