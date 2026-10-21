import React from "react";
import { Button } from "design/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, SendIcon } from "@hugeicons/core-free-icons";
import type { PostExtended } from "@/features/posts/components/post-card";
import ResponsiveDialog from "@/shared/components/responsive-dialog";
import type { UserMinimal } from "@campus/api";
import { useSession } from "@/features/auth/hooks";
import { useConnections } from "@/features/activities/hooks/activity.hook";
import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar"
import { Input } from "design/components/ui/input";


const SendDirectPost = ({ post }: { post: PostExtended }) => {
    const [attemptSendPost, setAttemptSendPost] = React.useState(false);
    const [sendCount, setSendCount] = React.useState(post.share_count);
    const [users, setUsers] = React.useState<UserMinimal[]>([]);
    const [selectedUsers, setSelectedUsers] = React.useState<UserMinimal[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");


    const { data: session } = useSession()
    const { listFollowing } = useConnections()
    const { data: usersData, isLoading: usersLoading, isError: usersError, error: usersErrorData } = listFollowing(session?.data.user.id!)

    React.useEffect(() => {
        if (usersData) {
            setUsers(usersData.data?.results || []);
        }
    }, [usersData])

    const toggleSelectedUser = (user: UserMinimal) => {
        if (selectedUsers.includes(user)) {
            setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    }

    return (
        <ResponsiveDialog
            trigger={
                <Button
                    variant={"ghost"}
                    size={"lg"}
                    className="flex flex-row items-center gap-1 rounded-full hover:bg-accent/50"
                    onClick={() => setAttemptSendPost(true)}
                >
                    <HugeiconsIcon icon={SendIcon} className="size-5" />
                    <span className="text-xs text-muted-foreground">
                        {sendCount}
                    </span>
                </Button>
            }
            open={attemptSendPost}
            onOpenChange={setAttemptSendPost}
            title={
                <div className="flex flex-row items-center gap-2 justify-center text-xl font-semibold border-b pb-2">
                    <span>Send</span>
                </div>
            }
            children={
                <>
                    <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 h-full">

                        {
                            usersLoading ? (
                                <span>Loading...</span>
                            ) : usersError ? (
                                <span>Error {JSON.stringify(usersErrorData, null, 2)}</span>
                            ) : (
                                usersData.data?.results?.filter((user: UserMinimal) => user.username.toLowerCase().includes(searchQuery.toLowerCase())).map((user: UserMinimal) => (
                                    <div key={user.id}
                                        className="relative flex flex-col items-center gap-2.5 active:not-aria-[haspopup]:scale-90 transition-all duration-200 cursor-pointer hover:bg-accent/50 rounded-md p-2"
                                        onClick={() => toggleSelectedUser(user)}
                                    >
                                        <Avatar size="2xl">
                                            <AvatarImage src={user.avatar ?? undefined} />
                                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="">
                                            <span className="text-sm text-muted-foreground">@{user.username}</span>
                                        </div>
                                        {selectedUsers.includes(user) && (
                                            <div className="absolute top-0 right-0 bg-accent rounded-full">
                                                <HugeiconsIcon icon={CheckIcon} className="size-5" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )
                        }
                    </div>
                </>
            }
            footer={
                <div className="w-full gap-2">
                    {selectedUsers.length > 0 ? (
                        <>
                            <Button
                                variant={"outline"}
                                onClick={() => setAttemptSendPost(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={"default"}
                                onClick={() => setAttemptSendPost(false)}
                            >
                                Share
                            </Button>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            }
        />
    );
};

export default SendDirectPost;
