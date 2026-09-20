import ChatMessageBubble from "./chat-message-bubble";
import type { Message as MessageT } from "../http/chat.http";
import type { ReactNode } from "react";

interface ChatMessageListProps {
    messages: MessageT[];
    currentUserId?: string;
    header?: ReactNode;
}

const ChatMessageList = ({ messages, currentUserId, header }: ChatMessageListProps) => {
    // Container is flex-col-reverse, so the DOM's first child renders at the
    // bottom of the screen. Reversing the array puts the newest message
    // first in the DOM → bottom of screen, oldest last → top, right under `header`.
    // Assumes `messages` comes oldest-first from the API — flip this reverse if not.
    const reversedMessages = [...messages].reverse();

    return (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse gap-2 px-4 border">
            {reversedMessages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} isOwn={message.sender.id === currentUserId} />
            ))}
            {header}
        </div>
    );
};

export default ChatMessageList;