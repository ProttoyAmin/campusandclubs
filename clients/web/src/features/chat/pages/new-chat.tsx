import { useEffect, useState } from "react";
import UsersSearchInput from "@/features/user/components/users-search-input";
import type { UserMinimal } from "@campus/api";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import {
    Avatar, AvatarFallback, AvatarImage,
    AvatarGroup,
    AvatarGroupCount,
} from "design/components/ui/avatar";
import SendMessage from "../components/send-message";
import { useChats } from "../hooks/chat.hooks";
import type { ChatStartDTO } from "../http/chat.http";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/settings/routes";
import { useSocketEvent } from "@/shared/hooks/use-socket-event";

const NewChat = () => {
    const location = useLocation();
    const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;
    const [users, setUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
    const [selectedUsers, setSelectedUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
    const [message, setMessage] = useState("");
    const pageHeader = usePageHeader();
    const { startChat } = useChats();
    const navigate = useNavigate();


    useSocketEvent("chat:message", (data: unknown) => {
        // TODO: handle websocket event next
    })



    useEffect(() => {
        const id = pageHeader.push(
            <>
                <div className="flex items-center gap-4">
                    <NavigateButtons hideForward />
                    <h1 className="text-lg font-semibold">New Chat</h1>
                </div>
            </>,
        );

        return () => {
            pageHeader.pop(id)
        };
    }, [pageHeader.push, pageHeader.pop]);

    const hanleSend = () => {
        const data: ChatStartDTO = {
            participant_ids: selectedUsers.map((user) => user.id),
            content: message
        }
        startChat.mutate(data, {
            onSuccess: (data) => {
                console.log(data.data);
                navigate(paths.private.chat.inbox(data.data?.chat?.id))
            }
        })

    }

    const MAX_VISIBLE = 2;

    return (
        <>
            <div className="grid grid-rows-[auto_1fr] h-full w-full overflow-hidden">
                <UsersSearchInput users={users} setUsers={setUsers} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
                {selectedUsers.length > 0 && (
                    <>
                        <div className="flex flex-col items-center justify-center gap-4">
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
                            <span className="text-muted-foreground">{selectedUsers.length > 1 ? selectedUsers.map((user) => user.username).join(", ") : selectedUsers[0]?.username}</span>

                        </div>
                        <SendMessage message={message} setMessage={setMessage} sendMessage={hanleSend} />
                    </>
                )}
            </div>
        </>
    )
}

export default NewChat;