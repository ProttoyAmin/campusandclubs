import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { useChat } from '../hooks/chat.hooks';
import { useSession } from '@/features/auth/hooks';
import SendMessage from '../components/send-message';
import ChatIntro from '../components/chat-intro';
import ChatMessageList from '../components/chat-message-list';
import { socket } from '@/library/socket';
import { useDMOutlet } from '../context/use-chat-outlet';
import { useTypingIndicator } from '../hooks/use-typing-indicator';
import { Marker, MarkerContent, } from "design/components/ui/marker";
import { Button } from 'design/components/ui/button';
import { useChatContext } from '../context/use-chat-context';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { MessageSendDTO } from '../http/chat.http';

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
    const { replying, setReplying } = useChatContext();
    const { messagesData, messageSend, acceptPendingChat, declinePendingChat } = useChat(id as string);
    const [newMessage, setNewMessage] = useState<string>("");
    const { data: session } = useSession();
    const currentUserId = session?.data.user?.id;
    const chatData = chat

    const participants = chatData?.participants.filter((p) => p.user.id !== currentUserId) ?? [];
    const userChat = chatData?.participants.find((p) => p.user.id === currentUserId);
    const isGroup = chatData?.type === "GROUP";

    React.useEffect(() => {
        socket.send("chat:seen", { chat_id: id });
        return () => {
            socket.send("chat:seen", { chat_id: id });
        }
    }, [id]);

    const {
        handleKeystroke,
        stopTyping,
        isAnyoneTyping,
        typingLabel,
    } = useTypingIndicator(id, currentUserId);

    const sendMessage = () => {
        const data: MessageSendDTO = {
            reply_to: replying?.id ?? null,
            content: newMessage
        }
        messageSend.mutate(data);
        setNewMessage("");
        stopTyping();
        socket.send("chat:message", { chat_id: id, data: data })
    }
    return (
        <div className="flex flex-col gap-3 h-full justify-between min-h-0 max-h-[calc(100vh-4.5rem)] p-2">
            {/* <pre>{JSON.stringify(userChat, null, 2)}</pre> */}
            {/* <div className='border p-10 border-amber-400 h-full'> */}
            <ChatMessageList
                messages={messagesData.data?.data?.data ?? []}
                currentUserId={currentUserId}
                header={<ChatIntro participants={participants} isGroup={isGroup} />}
            />
            {/* </div> */}
            {/* </div> */}
            {isAnyoneTyping && (
                <div className='animate-[slideInUp_0.3s_ease-out]'>
                    <TypingIndicator label={typingLabel} />
                </div>
            )}
            {replying && (
                <div className="flex items-center justify-between border-t pt-4 px-4">
                    <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">
                            Replying to <span className='font-medium text-foreground'>@{replying.sender.username}</span>
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                            {replying.content}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplying(null)}
                    >
                        <HugeiconsIcon icon={Cancel01Icon} />
                    </Button>
                </div>
            )}
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