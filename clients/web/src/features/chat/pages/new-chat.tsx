import { useState } from "react";
import UsersSearchInput from "@/features/user/components/users-search-input";
import type { UserMinimal } from "@campus/api";
import NavigateButtons from "@/shared/components/navigate-buttons";
import {
    Avatar, AvatarFallback, AvatarImage,
    AvatarGroup,
    AvatarGroupCount,
} from "design/components/ui/avatar";
import SendMessage from "../components/send-message";
import { useChats } from "../hooks/chat.hooks";
import type { ChatStartDTO } from "../http/chat.http";
import { useNavigate, useLocation } from "react-router-dom";
import { paths, routes } from "@/settings/routes";
import { useSocketEvent } from "@/shared/hooks/use-socket-event";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserSearch01Icon } from "@hugeicons/core-free-icons";
import { Button } from "design/components/ui/button";
import { XIcon } from "lucide-react";

const NewChat = () => {
    const location = useLocation();
    const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;
    const [users, setUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
    const [selectedUsers, setSelectedUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
    const [message, setMessage] = useState("");
    const { startChat } = useChats();
    const navigate = useNavigate();

    useSocketEvent("chat:message", (data: unknown) => {
        console.log("data from websocket event chat:message", data);
    });

    const handleSend = () => {
        if (!selectedUsers.length) return;
        const data: ChatStartDTO = {
            participant_ids: selectedUsers.map((user) => user.id),
            content: message
        };
        startChat.mutate(data, {
            onSuccess: (res) => {
                navigate(paths.private.chat.inbox(res.data?.chat?.id));
            }
        });
    };

    const MAX_VISIBLE = 2;

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
            {/* Header row with search and navigation */}
            <div className="flex items-center gap-3 p-4 shrink-0 sticky top-0 bg-background/80 backdrop-blur z-10">
                <NavigateButtons hideForward className="md:hidden" />
                <div className="flex-1">
                    <UsersSearchInput
                        users={users}
                        setUsers={setUsers}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                    />
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full size-8 shrink-0 hidden md:flex text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(routes.chat.chats)}
                    title="Close"
                >
                    <XIcon className="size-4" />
                </Button>
            </div>

            {/* Content body */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-4 min-h-0">
                {selectedUsers.length > 0 ? (
                    <>
                        <div className="flex flex-1 flex-col items-center justify-center gap-4">
                            <AvatarGroup>
                                {selectedUsers.slice(0, MAX_VISIBLE).map((user) => (
                                    <Avatar key={user.id} size="2xl">
                                        <AvatarImage src={user.avatar ?? undefined} />
                                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {selectedUsers.length > MAX_VISIBLE && (
                                    <AvatarGroupCount>+{selectedUsers.length - MAX_VISIBLE}</AvatarGroupCount>
                                )}
                            </AvatarGroup>
                            <span className="text-sm font-medium text-muted-foreground">
                                {selectedUsers.length > 1
                                    ? selectedUsers.map((user) => user.username).join(", ")
                                    : `@${selectedUsers[0]?.username}`}
                            </span>
                        </div>
                        <div className="shrink-0 w-full pt-2">
                            <SendMessage
                                message={message}
                                setMessage={setMessage}
                                sendMessage={handleSend}
                                onKeystroke={() => { }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center p-8 select-none">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                            <HugeiconsIcon icon={UserSearch01Icon} className="size-7" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">Search for someone</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mt-1">
                            Type a name or username above to find people and start a conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewChat;