import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import { Bubble, BubbleContent } from "design/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "design/components/ui/message";
import type { Message as MessageT } from "../http/chat.http";

interface ChatMessageBubbleProps {
    message: MessageT;
    isOwn: boolean;
}

const ChatMessageBubble = ({ message, isOwn }: ChatMessageBubbleProps) => (
    <Message align={isOwn ? "end" : "start"}>
        {!isOwn && (
            <MessageAvatar>
                <Avatar>
                    <AvatarImage src={message.sender.avatar ?? undefined} alt={message.sender.username} />
                    <AvatarFallback>{message.sender.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
            </MessageAvatar>
        )}
        <MessageContent>
            <Bubble variant={isOwn ? undefined : "muted"}>
                <BubbleContent>{message.content}</BubbleContent>
            </Bubble>
        </MessageContent>
    </Message>
);

export default ChatMessageBubble;