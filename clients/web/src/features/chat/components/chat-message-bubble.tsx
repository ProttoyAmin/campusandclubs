import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import { Bubble, BubbleGroup, BubbleContent } from "design/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "design/components/ui/message";
import type { Message as MessageT } from "../http/chat.http";

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
                        <AvatarImage src={sender.avatar ?? undefined} alt={sender.username} />
                        <AvatarFallback>{sender.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </MessageAvatar>
            )}
            <MessageContent>
                {!isOwn ? (
                    <>
                        <BubbleGroup>
                            {messages.map((message) => (
                                <Bubble key={message.id} variant={isOwn ? undefined : "muted"}>
                                    <BubbleContent>{message.content}</BubbleContent>
                                </Bubble>
                            ))}
                        </BubbleGroup>
                    </>
                ) : (
                    <>
                        {messages.map((message) => (
                            <Bubble key={message.id} variant={isOwn ? undefined : "muted"}>
                                <BubbleContent>{message.content}</BubbleContent>
                            </Bubble>
                        ))}
                    </>
                )}
            </MessageContent>
        </Message>
    );
};

export default ChatMessageGroup;