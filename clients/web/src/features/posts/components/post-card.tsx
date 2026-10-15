import React, { useState } from "react";
import type { Club, MediaList, Post, UserProfile } from "@campus/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardFooter,
    CardAction,
} from "design/components/ui/card";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "design/components/ui/avatar";
import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MessageCircleIcon,
    MenuTwoLineIcon,
} from "@hugeicons/core-free-icons";
import { Link, useNavigate } from "react-router-dom";
import { getTimeAgo } from "@/utils/format-date";
import { paths } from "@/settings/routes";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
} from "design/components/ui/dropdown-menu";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";
import { Skeleton } from "design/components/ui/skeleton";
import { useSession } from "@/features/auth/hooks";
import Like from "@/features/interactions/components/like";
import Repost from "@/features/interactions/components/repost";
import SendDirectPost from "@/features/interactions/components/send";
import AppAlertDialog from "@/shared/components/alert";
import VideoPlayer from "./video-player";

export type MediaListExtended = MediaList & {
    id: string
    target: {
        id: string
        model: string
    }
    original_file_name: string
    bytes: number
    mime_type: string
    format: string
    secure_url: string
    playback_url: string
    role: string
    position: number
    public_id: string
    resource_type: string
    version: number
}

export const PostCardSkeleton = () => {
    return (
        <>
            <div className="bg-background rounded-none h-fit flex flex-col gap-2 px-1 py-1 md:px-4 md:py-2">
                <div className="flex gap-2.5 items-center justify-between">
                    <div className="flex gap-2.5 items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-25" />
                            <Skeleton className="h-4 w-12.5" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-6 w-10" />
                    </div>
                </div>
                <div className={`w-full`}>
                    <div className="pl-14 flex flex-col gap-1 items-start">
                        <Skeleton className="w-1/2 h-40" />
                    </div>
                </div>
            </div>
        </>
    )
}

export type PostExtended = Post & {
    readonly author: Pick<UserProfile, "id" | "username" | "avatar">,
    readonly media: MediaListExtended[]
    readonly club: Pick<Club, "id" | "name" | "slug">
}

type PostCardProps = {
    post: PostExtended
    enableNavigate?: boolean
    reduceContent?: boolean
}

const PostCard = ({ post, enableNavigate = true, reduceContent = true }: PostCardProps) => {

    const navigate = useNavigate();
    const { data: session } = useSession();
    const [open, setOpen] = useState<boolean>(false);
    const [attemptRemove, setAttemptRemove] = useState<boolean>(false);

    const media: MediaListExtended[] = post.media.sort((a, b) => a.position - b.position);
    return (
        <>
            <Card className="bg-background rounded-none h-fit flex flex-row gap-2 px-1 py-1 md:px-2 md:py-2 ring-0">
                <CardHeader className="flex flex-col items-center py-2">
                    <Link to={`${paths.private.user.profile(post.author?.username)}`}>
                        <Avatar>
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>
                                {post.author.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </CardHeader>
                <div className={`w-full`} onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                }}>
                    <CardDescription className="flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <Link to={`${paths.private.user.profile(post.author?.username)}`}>
                                <span className="text-base text-accent-foreground hover:underline font-bold cursor-pointer">
                                    {post.author?.username}
                                </span>
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {getTimeAgo(post.created_at)}
                            </span>
                            {post.club && (
                                <>
                                    <Link to={`${paths.public.club.slug(post.club?.slug || "")}`}>
                                        <span className="text-blue-400 hover:underline font-semibold cursor-pointer">
                                            @{post.club?.name}
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <ResponsiveDropDownMenu
                            open={open}
                            onOpenChange={setOpen}
                            trigger={<Button variant={"ghost"} onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }}>
                                <HugeiconsIcon icon={MenuTwoLineIcon} className="size-6" />
                            </Button>}
                        >
                            <DropdownMenuGroup className={''}>
                                <DropdownMenuItem className={'p-4 cursor-pointer'}>Copy link</DropdownMenuItem>
                                <DropdownMenuItem className={'p-4 cursor-pointer'}>Save</DropdownMenuItem>
                                <DropdownMenuItem className={'p-4 cursor-pointer'}>Not interested</DropdownMenuItem>
                                {session?.meta?.is_authenticated && post.author.id === session?.data.user.id && (
                                    <DropdownMenuItem variant="destructive" className={'p-4 cursor-pointer'} onClick={() => setAttemptRemove(true)}>Remove</DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                        </ResponsiveDropDownMenu>
                    </CardDescription>
                    <CardContent className={`p-0 ${enableNavigate ? "cursor-pointer" : ""}`} onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        if (enableNavigate) {
                            navigate(paths.private.user.posts.detail(post.author?.username, post.id))
                        }
                    }}>
                        {post.content && (
                            <div className="whitespace-pre-wrap mb-4">
                                {
                                    reduceContent ? (post.content?.split(/\s+/).slice(0, 25).join(" ") + (post.content?.split(/\s+/).length > 25 ? "..." : "")) : post.content
                                }
                            </div>
                        )}
                        {media?.length ? (
                            <div className="flex flex-row gap-4 p-0 min-h-fit overflow-x-scroll scrollbar-none">
                                {media?.map((media) => {
                                    switch (media.resource_type) {
                                        case "image":
                                            return <img key={media.id} className="h-90 w-90 object-cover" src={media.secure_url} alt={`${post.author?.username}-${media.role}-${media.resource_type}`} />;
                                        case "video":
                                            return <VideoPlayer
                                                key={media.id}
                                                src={media.public_id}
                                                className="h-90 w-90 object-cover"
                                            />
                                        default:
                                            return null;
                                    }
                                })}
                                {/* <img className="h-90 w-90 object-cover" src={'https://www.superherotoystore.com/cdn/shop/articles/e33c2fa94c03efa06678116f80d62d0d_1c4bccf2-0e38-4f4c-8dcd-f51830857d15_708x.jpg?v=1757494254'} alt={''} />
                                <img className="h-90 w-90 object-cover" src={'https://images.immediate.co.uk/production/volatile/sites/3/2023/03/goku-dragon-ball-guru-824x490-11b2006-e1697471244240.jpg?quality=90&resize=600,400'} alt={''} /> */}
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter className="p-0 mt-2">
                        <div className="flex items-center">
                            <CardAction>
                                <Like post={post} />
                            </CardAction>
                            <CardAction>
                                <Link to={paths.private.user.posts.detail(post.author?.username, post.id)}>
                                    <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                                        <HugeiconsIcon icon={MessageCircleIcon} className="size-5" />
                                        <span className="text-xs text-muted-foreground">
                                            {post.comment_count}
                                        </span>
                                    </Button>
                                </Link>
                            </CardAction>
                            <CardAction>
                                <Repost post={post} />
                            </CardAction>
                            <CardAction>
                                <SendDirectPost post={post} />
                            </CardAction>
                        </div>
                    </CardFooter>
                </div>
            </Card>
            <AppAlertDialog
                open={attemptRemove}
                onOpenChange={setAttemptRemove}
                title="Are you sure?"
                description="This action cannot be undone."
                onConfirm={() => {
                    setAttemptRemove(false);
                }}
                variant={"destructive"}
            />
        </>
    );
};

export default PostCard;
