import ChatMessageBubble from "./chat-message-bubble";
import type { Message as MessageT } from "../http/chat.http";
import type { ReactNode } from "react";

interface ChatMessageListProps {
    messages?: MessageT[];
    currentUserId?: string;
    header?: ReactNode;
}

const groupBySender = (messages: MessageT[] = []): MessageT[][] => {
    if (!Array.isArray(messages)) {
        return [];
    }
    const groups: MessageT[][] = [];
    for (const message of messages) {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup[0]?.sender?.id === message.sender?.id) {
            lastGroup.push(message);
        } else {
            groups.push([message]);
        }
    }
    return groups;
};

const ChatMessageList = ({ messages = [], currentUserId, header }: ChatMessageListProps) => {
    // Container is flex-col-reverse, so the DOM's first child renders at the
    // bottom of the screen. Reversing the array puts the newest message
    // first in the DOM → bottom of screen, oldest last → top, right under `header`.
    // Assumes `messages` comes oldest-first from the API — flip this reverse if not.
    const safeMessages = Array.isArray(messages) ? messages : [];
    const groups = groupBySender(safeMessages).reverse();

    return (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse gap-2.5 scrollbar-none">
            {groups.map((group) => (
                <ChatMessageBubble key={group[0].id} messages={group} isOwn={group[0]?.sender?.id === currentUserId} />
            ))}
            {header}
        </div>
    );
};

export default ChatMessageList;
