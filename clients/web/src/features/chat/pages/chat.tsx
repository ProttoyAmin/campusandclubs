import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useChat } from '../hooks/chat.hooks';
import { useSession } from '@/features/auth/hooks';
import SendMessage from '../components/send-message';
import ChatIntro from '../components/chat-intro';
import ChatMessageList from '../components/chat-message-list';
import { useSocketEvent } from '@/shared/hooks/use-socket-event';
import { socket } from '@/library/socket';
import { queryClient } from '@/config/query-client';
import { useDMOutlet } from '../context/use-chat-outlet';
import { useTypingIndicator } from '../hooks/use-typing-indicator';
import { Marker, MarkerContent, } from "design/components/ui/marker";
import { Button } from 'design/components/ui/button';

const TypingIndicator = ({ label }: { label: string }) => {
    return (
        <Marker role="status" className='flex items-center gap-2 px-2'>
            <MarkerContent className="shimmer">
                <span className="text-sm text-muted-foreground">{label}</span>
            </MarkerContent>
        </Marker>
    )
}

const Chat = () => {
    const { id } = useParams();
    const { chat } = useDMOutlet();
    const { messagesData, messageSend, acceptPendingChat, declinePendingChat } = useChat(id as string);
    const [newMessage, setNewMessage] = useState<string>("");
    const { data: session } = useSession();
    const currentUserId = session?.data.user?.id;
    const chatData = chat

    const participants = chatData?.participants.filter((p) => p.user.id !== currentUserId) ?? [];
    const userChat = chatData?.participants.find((p) => p.user.id === currentUserId);
    const isGroup = chatData?.type === "GROUP";

    const {
        handleKeystroke,
        stopTyping,
        isAnyoneTyping,
        typingLabel,
    } = useTypingIndicator(id, currentUserId);

    const sendMessage = () => {
        const data = {
            content: newMessage
        }
        messageSend.mutate(data);
        setNewMessage("");
        stopTyping();
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
        <div className="flex flex-col gap-3 h-full justify-between overflow-hidden min-h-0 max-h-[calc(100vh-4.5rem)] p-2">
            {/* <pre>{JSON.stringify(userChat, null, 2)}</pre> */}
            {/* <div className='border p-10 border-amber-400 h-full'> */}
            <ChatMessageList
                messages={messagesData.data?.data ?? []}
                currentUserId={currentUserId}
                header={<ChatIntro participants={participants} isGroup={isGroup} />}
            />
            {/* </div> */}
            {/* </div> */}
            <div className='animate-[slideInUp_0.3s_ease-out]'>
                {isAnyoneTyping && (
                    <TypingIndicator label={typingLabel} />
                )}
            </div>
            {userChat?.status === "accepted" ? (
                <SendMessage
                    message={newMessage}
                    setMessage={setNewMessage}
                    sendMessage={() => sendMessage()}
                    onKeystroke={handleKeystroke}
                />
            ) : (
                <div className="flex justify-center gap-2">
                    <Button
                        onClick={() => acceptPendingChat.mutate(id as string)}
                        disabled={acceptPendingChat.isPending}
                        size='lg'
                        variant='glass'
                    >
                        Accept
                    </Button>
                    <Button
                        onClick={() => declinePendingChat.mutate(id as string)}
                        disabled={declinePendingChat.isPending}
                        variant="destructive"
                        size='lg'
                    >
                        Decline
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Chat;