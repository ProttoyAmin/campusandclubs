import React, { useState } from "react";
import { type Club, type MediaList, type Post, type UserProfile } from "@campus/api";
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
    Refresh03Icon,
    SendIcon,
    MessageCircleIcon,
    FavouriteIcon,
    MenuTwoLineIcon
} from "@hugeicons/core-free-icons";
import { Link, useNavigate } from "react-router-dom";
import { getTimeAgo } from "@/utils/format-date";
import { paths } from "@/settings/routes";
import {
    DropdownMenuGroup,
    DropdownMenuItem,
} from "design/components/ui/dropdown-menu";
import ResponsiveDropDownMenu from "@/shared/components/responsive-dropdown-menu";
import { queryClient } from "@/config/query-client";
import { usePost } from "../hooks/posts.hooks";

export type MediaListExtended = MediaList & {
    id: string | number;
    file: {
        url: string,
        secure_url: string,
        public_id: string,
        resource_type: string,
        type: string,
        format: string,
        width: number,
        height: number,
        bytes: number,
    }
    position: number,
    role: string
}


export type PostExtended = Post & {
    readonly author: Pick<UserProfile, "id" | "username" | "avatar">,
    readonly media: MediaListExtended[]
    readonly club: Pick<Club, "id" | "name" | "slug">
}

const PostCard = ({ post, enableNavigate = true }: { post: PostExtended, enableNavigate?: boolean }) => {

    const navigate = useNavigate();
    const [liked, setLiked] = useState(!!post.is_liked)
    const [open, setOpen] = useState<boolean>(false)

    const { toggleLike } = usePost(post.id);
    const media: MediaListExtended[] = post.media.sort((a, b) => a.position - b.position)
    return (
        <>
            <Card className="bg-background rounded-none h-fit flex flex-row gap-2 px-1 py-1 md:px-2 md:py-2">
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
                            trigger={<Button variant={"ghost"} onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}>
                                <HugeiconsIcon icon={MenuTwoLineIcon} className="size-6" />
                            </Button>}
                        >
                            <DropdownMenuGroup className={''}>
                                <DropdownMenuItem className={'p-4'}>Copy link</DropdownMenuItem>
                                <DropdownMenuItem className={'p-4'}>Save</DropdownMenuItem>
                                <DropdownMenuItem className={'p-4'}>Not interested</DropdownMenuItem>
                                <DropdownMenuItem className={'p-4'}>First Item</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </ResponsiveDropDownMenu>
                    </CardDescription>
                    <CardContent className={`p-0 ${enableNavigate ? "cursor-pointer" : ""}`} onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        if (enableNavigate) {
                            navigate(paths.private.user.posts.detail(post.author?.username, post.id))
                        }
                    }}>
                        <div className="mb-4">
                            <p>{post.content}</p>
                        </div>
                        {media?.length ? (
                            <div className="flex flex-row gap-4 p-0 min-h-fit overflow-x-scroll scrollbar-none">
                                {media?.map((media) => {
                                    switch (media.file?.resource_type) {
                                        case "image":
                                            return <img key={media.id} className="h-90 w-90 object-cover" src={media.file?.url} alt={`${post.author?.username}-${media.role}-${media.file?.resource_type}`} />;
                                        case "video":
                                            return <video key={media.id} className="h-90 w-90 object-cover" src={media.file?.url} />;
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
                            <CardAction onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                setLiked(prev => !prev);
                                toggleLike.mutate(undefined, {
                                    onSuccess: () => {
                                        queryClient.invalidateQueries({ queryKey: ["users", post.author?.username, 'posts'] });
                                    },
                                    onError: () => {
                                        setLiked(prev => !prev);
                                    }
                                });
                            }}>
                                <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                                    <HugeiconsIcon icon={FavouriteIcon} className={`size-5 ${liked ? 'text-red-500' : 'text-muted-foreground'}`} fill={liked ? 'red' : 'none'} />
                                    <span className={`text-xs text-muted-foreground ${liked ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {post.like_count}
                                    </span>
                                </Button>
                            </CardAction>
                            <CardAction>
                                <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                                    <HugeiconsIcon icon={MessageCircleIcon} className="size-5" />
                                    <span className="text-xs text-muted-foreground">
                                        {post.comment_count}
                                    </span>
                                </Button>
                            </CardAction>
                            <CardAction>
                                <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                                    <HugeiconsIcon
                                        icon={Refresh03Icon}
                                        className="size-5"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {post.repost_count}
                                    </span>
                                </Button>
                            </CardAction>
                            <CardAction>
                                <Button variant={"ghost"} size={"lg"} className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50">
                                    <HugeiconsIcon icon={SendIcon} className="size-5" />
                                    <span className="text-xs text-muted-foreground">
                                        {post.share_count}
                                    </span>
                                </Button>
                            </CardAction>
                        </div>
                    </CardFooter>
                </div>
            </Card>
        </>
    );
};

export default PostCard;
