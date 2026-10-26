import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import { Bubble, BubbleGroup, BubbleContent } from "design/components/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageHeader } from "design/components/ui/message";
import type { Message as MessageT } from "../http/chat.http";
import ChatMessageActions from "./chat-message-actions";
import { cn } from "design/lib/utils";
import Linkify from "linkify-react";

interface ChatMessageGroupProps {
    messages: MessageT[]; // consecutive messages from the same sender, oldest-first
    isOwn: boolean;
}

const ChatMessageGroup = ({ messages, isOwn }: ChatMessageGroupProps) => {
    const sender = messages[0].sender;

    return (
        <Message align={isOwn ? "end" : "start"}>
            {!isOwn && (
                <MessageAvatar>
                    <Avatar>
                        <AvatarImage src={sender?.avatar ?? undefined} alt={sender?.username} />
                        <AvatarFallback>{sender?.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </MessageAvatar>
            )}
            <MessageContent>
                <BubbleGroup>
                    {!isOwn && <MessageHeader>{sender?.username}</MessageHeader>}
                    {[...messages].reverse().map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "group/message-row relative flex items-center gap-1.5",
                                isOwn ? "flex-row-reverse self-end" : "flex-row self-start"
                            )}
                        >
                            {message.content ? (
                                <Bubble variant={isOwn ? "tinted" : "outline"} className="relative">
                                    <BubbleContent>
                                        <Linkify
                                            options={{
                                                className: "text-blue-600 hover:text-blue-700 underline",
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                            }}
                                        >
                                            {message.content}
                                        </Linkify>
                                    </BubbleContent>
                                </Bubble>
                            ) : null}
                            <ChatMessageActions message={message} isOwn={isOwn} />
                        </div>
                    ))}
                </BubbleGroup>
            </MessageContent>
        </Message>
    );
};

export default ChatMessageGroup;