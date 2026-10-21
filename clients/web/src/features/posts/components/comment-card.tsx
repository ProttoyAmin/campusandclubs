import { Button } from "design/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "design/components/ui/avatar";

import type { Comment } from "@/types/comment";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    FavouriteIcon,
    MoreHorizontalIcon,
    ReplyIcon,
} from "@hugeicons/core-free-icons";

import { getTimeAgo } from "@/utils/format-date";
import React from "react";
import { useComment } from "@/features/interactions/hooks/interaction.hooks";
import { Spinner } from "design/components/ui/spinner";


const CommentCard = ({ comment, onReply, size = "lg" }: { comment: Comment, onReply: (username: string, parentId: string) => void, size?: "sm" | "lg" | "default" | "xl" | "2xl" | "3xl" }) => {
    const [showReplies, setShowReplies] = React.useState(false);
    const { replies } = useComment(comment.id, { enabled: showReplies });
    const { data: repliesData, isLoading: repliesLoading } = replies;

    const commentReplies = (repliesData?.results ?? []) as Comment[];

    const handleReplies = () => setShowReplies((prev) => !prev);

    const handleReply = () => {
        onReply(comment.author.username, comment.id);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-row gap-2 justify-between">
                <div className="flex flex-row gap-2">
                    <Avatar className="w-10 h-10" size={size}>
                        <AvatarImage src={comment.author?.avatar} />

                        <AvatarFallback>
                            {comment.author?.username
                                .slice(0, 2)
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-1">
                        <div className="flex flex-row gap-2">
                            <span className={`font-bold ${size === "sm" ? "text-xs" : ""}`}>
                                {comment.author?.username}
                            </span>

                            <span className={`text-muted-foreground ${size === "sm" ? "text-xs" : ""}`}>
                                {getTimeAgo(comment.created_at)}
                            </span>
                            <Button size="icon-xs" variant="ghost" className={`rounded-full text-muted-foreground ${size === "sm" ? "text-xs" : ""}`}>
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
                            </Button>
                        </div>

                        <div className={` ${size === "sm" ? "text-xs" : ""}`}>
                            {comment.content}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row items-center">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="flex flex-row items-center gap-1 rounded-full"
                    >
                        <HugeiconsIcon
                            icon={FavouriteIcon}
                            className="size-5"
                        />

                        <span className="text-xs text-muted-foreground">
                            1,231
                        </span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleReply}
                        className="flex flex-row items-center gap-1 rounded-full"
                    >
                        <HugeiconsIcon
                            icon={ReplyIcon}
                            className="size-5"
                        />

                        <span className="text-xs text-muted-foreground">
                            132
                        </span>
                    </Button>
                </div>
            </div>

            {showReplies && commentReplies.length > 0 && (
                <div className="ml-12 pl-4 mt-4 space-y-4 border-l-2 animate-[revealFromTop_0.1s_ease-out]">
                    {commentReplies.map((reply) => (
                        <CommentCard key={reply.id} comment={reply} onReply={onReply} size="sm" />
                    ))}
                </div>
            )}

            {comment.reply_count > 0 && (
                <div className="pl-12 flex flex-row items-center gap-2">
                    <Button variant="link" size="sm" className="text-xs p-0 text-muted-foreground" onClick={handleReplies}>
                        {showReplies ? 'Hide' : 'View'} replies ({comment.reply_count})
                    </Button>
                    {repliesLoading && (
                        <Spinner />
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentCard;