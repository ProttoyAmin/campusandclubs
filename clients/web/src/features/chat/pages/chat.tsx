import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useChat } from '../hooks/chat.hooks';
import { useSession } from '@/features/auth/hooks';
import SendMessage from '../components/send-message';
import ChatIntro from '../components/chat-intro';
import ChatMessageList from '../components/chat-message-list';
import useChatOutlet from '../context/use-chat-outlet';
import { useSocketEvent } from '@/shared/hooks/use-socket-event';
import { socket } from '@/library/socket';
import { queryClient } from '@/config/query-client';

const Chat = () => {
    const { id } = useParams();
    const { chats } = useChatOutlet()
    const { messages, messageSend } = useChat(id as string);
    const [newMessage, setNewMessage] = useState<string>("");
    const { data: session } = useSession();
    const currentUserId = session?.data.user?.id;

    const currentChat = chats.find((c) => c.id === id);
    const participants = currentChat?.participants.filter((p) => p.id !== currentUserId) ?? [];
    const isGroup = currentChat?.type === "GROUP";

    const sendMessage = () => {
        const data = {
            content: newMessage
        }
        messageSend.mutate(data);
        setNewMessage("");
        socket.send("chat:message", { chat_id: id, content: data.content })
    }

    useSocketEvent("chat:message", (data) => {
        console.log("Received:", data);
        queryClient.invalidateQueries({
            queryKey: ["chats", id],
        })
        queryClient.invalidateQueries({
            queryKey: ["chats"],
        })
    });


    return (
        <div className="flex flex-col gap-6 h-full overflow-hidden min-h-0 p-2">
            <ChatMessageList
                messages={messages.data ?? []}
                currentUserId={currentUserId}
                header={<ChatIntro participants={participants} isGroup={isGroup} />}
            />
            <SendMessage
                message={newMessage}
                setMessage={setNewMessage}
                sendMessage={() => sendMessage()}
            />
        </div>
    );
};

export default Chat;