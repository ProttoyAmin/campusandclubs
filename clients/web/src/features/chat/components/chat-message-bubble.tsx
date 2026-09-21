import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import { Bubble, BubbleGroup, BubbleContent } from "design/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "design/components/ui/message";
import { CheckCheck, Check, Trash2 } from "lucide-react";
import type { Message as MessageT } from "../http/chat.http";

interface ChatMessageGroupProps {
  messages: MessageT[]; // consecutive messages from the same sender, oldest-first
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
}

const renderReceiptIcon = (status: MessageT["my_status"], isOwn: boolean) => {
  if (!isOwn) return null;
  if (status === "seen") return <CheckCheck className="size-3.5 text-primary" />;
  if (status === "delivered") return <CheckCheck className="size-3.5 text-muted-foreground" />;
  return <Check className="size-3.5 text-muted-foreground" />;
};

const renderAttachments = (message: MessageT) =>
  message.attachments?.map((a) => {
    if (a.kind === "image") {
      return (
        <img
          key={a.id}
          src={a.file_url}
          alt={a.file_name ?? "attachment"}
          className="rounded-md max-h-64 w-auto object-cover mt-1"
        />
      );
    }
    return (
      <a
        key={a.id}
        href={a.file_url}
        target="_blank"
        rel="noreferrer"
        className="block mt-1 text-xs underline underline-offset-2"
      >
        📎 {a.file_name ?? "Attachment"}
      </a>
    );
  });

const ChatMessageGroup = ({ messages, isOwn, onDelete }: ChatMessageGroupProps) => {
  const sender = messages[0].sender;
  return (
    <Message align={isOwn ? "end" : "start"}>
      {!isOwn && (
        <MessageAvatar>
          <Avatar>
            <AvatarImage src={sender.avatar ?? undefined} alt={sender.username} />
            <AvatarFallback>{sender.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        <BubbleGroup>
          {messages.map((message) => {
            if (message.deleted_mode === "FOR_EVERYONE" || message.is_tombstone) {
              return (
                <Bubble key={message.id} variant="muted" className="italic text-muted-foreground text-xs">
                  <BubbleContent>This message was deleted</BubbleContent>
                </Bubble>
              );
            }
            return (
              <div key={message.id} className="group/bubble relative">
                <Bubble variant={isOwn ? undefined : "muted"}>
                  <BubbleContent>
                    {message.content}
                    {renderAttachments(message)}
                    <div className="flex items-center justify-end gap-1 mt-0.5 -mb-1">
                      {message.edited_at && <span className="text-[10px] text-muted-foreground italic">edited</span>}
                      {renderReceiptIcon(message.my_status, isOwn)}
                    </div>
                  </BubbleContent>
                </Bubble>
                {isOwn && (
                  <button
                    onClick={() => onDelete?.(message.id)}
                    className="hidden group-hover/bubble:flex absolute -left-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                    aria-label="Delete message"
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                {Object.keys(message.reactions ?? {}).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(message.reactions).map(([emoji, users]) => (
                      <span
                        key={emoji}
                        className="text-xs bg-background border rounded-full px-1.5 py-0.5"
                        title={users.map((u) => u.username).join(", ")}
                      >
                        {emoji} {users.length}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </BubbleGroup>
      </MessageContent>
    </Message>
  );
};

export default ChatMessageGroup;
