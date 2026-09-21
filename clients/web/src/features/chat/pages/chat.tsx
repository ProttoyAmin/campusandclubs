import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../hooks/chat.hooks";
import { useSession } from "@/features/auth/hooks";
import SendMessage from "../components/send-message";
import ChatIntro from "../components/chat-intro";
import ChatMessageList from "../components/chat-message-list";
import useChatOutlet from "../context/use-chat-outlet";
import { Spinner } from "design/components/ui/spinner";
import { useSocketEvent } from "@/shared/hooks/use-socket-event";
import type { Message } from "../http/chat.http";
import { queryClient } from "@/config/query-client";

const Chat = () => {
    const { id } = useParams<{ id: string }>();
    const { chats = [] } = useChatOutlet() ?? {};
    const { messages, messageSend, uploadMessage, markSeen, deleteMessage } = useChat(id as string);
    const [newMessage, setNewMessage] = useState<string>("");
    const { data: session } = useSession();
    const currentUserId = session?.data?.user?.id;

    const currentChat = chats?.find((c) => c.id === id);
    const participants = currentChat?.participants?.filter((p) => p.id !== currentUserId) ?? [];
    const isGroup = currentChat?.type === "GROUP";

    const sendMessage = useCallback(
        (opts?: { files?: File[] }) => {
            if (!id) return;
            const content = newMessage.trim();
            if (!content && (!opts?.files || opts.files.length === 0)) return;
            if (opts?.files && opts.files.length > 0) {
                uploadMessage.mutate({ content, files: opts.files });
            } else {
                // REST send. After commit the server broadcasts "chat:message:new"
                // to the chat group. ChatSocketProvider is already joined to that
                // group and patches the React Query cache — no listener needed here.
                messageSend.mutate({ content });
            }
            setNewMessage("");
        },
        [id, newMessage, messageSend, uploadMessage],
    );

    const onVisibleLastMessage = useCallback(
        (msg: Message) => {
            if (msg.sender.id !== currentUserId) markSeen.mutate(msg.id);
        },
        [currentUserId, markSeen],
    );

    const onDeleteMessage = useCallback(
        (messageId: string) => {
            deleteMessage.mutate({ messageId, mode: "FOR_EVERYONE" });
        },
        [deleteMessage],
    );

    useSocketEvent("chat:message:new", (data) => {
        const { messageId } = data as { messageId: string };
        queryClient.invalidateQueries(["chats"])
    });

    //   if () return <Spinner className="mx-auto mt-20" />;
    const messageList: Message[] = messages.data ?? [];

    return (
        <div className="flex flex-col gap-3 h-full overflow-hidden min-h-0 p-2">
            <ChatMessageList
                messages={messageList}
                currentUserId={currentUserId}
                header={<ChatIntro participants={participants} isGroup={isGroup} />}
            />
            <SendMessage
                message={newMessage}
                setMessage={setNewMessage}
                sendMessage={sendMessage}
                isSending={messageSend.isPending || uploadMessage.isPending}
            />
        </div>
    );
};

export default Chat;
