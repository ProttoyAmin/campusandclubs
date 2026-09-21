import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar";
import { type ChatResponse } from "../http/chat.http";
import { getTimeAgo } from "@/utils/format-date";
import { cn } from "design/lib/utils";

interface ChatBoxProps {
  chat: ChatResponse;
  active?: boolean;
  currentUserId?: string;
}

const getChatTitle = (chat: ChatResponse, currentUserId?: string) => {
  if (chat.type === "DIRECT") {
    const other = chat.participants.find((p) => p.id !== currentUserId);
    return other?.username ?? "Chat";
  }
  return chat.name ?? chat.participants.map((p) => p.username).join(", ");
};

const getPreviewText = (chat: ChatResponse) => {
  const last = chat.last_message;
  if (!last) return "Say hi 👋";
  if (last.deleted_mode === "FOR_EVERYONE") return "This message was deleted";
  if (last.attachments?.length) {
    const kinds = last.attachments.map((a) => a.kind);
    if (kinds.includes("image")) return "📷 Photo";
    if (kinds.includes("video")) return "🎥 Video";
    if (kinds.includes("audio")) return "🎙 Voice message";
    return "📎 Attachment";
  }
  return last.content ?? "";
};

const ChatBox = ({ chat, active, currentUserId }: ChatBoxProps) => {
  const title = getChatTitle(chat, currentUserId);
  const otherParticipants = chat.participants.filter((p) => p.id !== currentUserId);
  const time = chat.last_message_at ?? chat.created_at;
  return (
    <div
      className={cn(
        "flex items-center gap-4 py-4 px-2 cursor-pointer hover:bg-card-foreground/5 transition-colors",
        active && "bg-card-foreground/10",
      )}
    >
      {chat.type === "DIRECT" ? (
        <Avatar className="shrink-0" size="lg">
          <AvatarImage src={otherParticipants[0]?.avatar ?? chat.avatar ?? undefined} alt={title} />
          <AvatarFallback className="text-primary text-sm">
            {(title?.[0] ?? "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <AvatarGroup className="shrink-0">
          {otherParticipants.slice(0, 2).map((p) => (
            <Avatar key={p.id}>
              <AvatarImage src={p.avatar ?? undefined} alt={p.username} />
              <AvatarFallback className="text-primary text-sm">
                {(p.username?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {otherParticipants.length > 2 && <AvatarGroupCount>+{otherParticipants.length - 2}</AvatarGroupCount>}
        </AvatarGroup>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          <p className="text-[11px] text-muted-foreground shrink-0">{getTimeAgo(time)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate">{getPreviewText(chat)}</p>
          {chat.unread_count > 0 && (
            <span className="inline-flex items-center justify-center text-[10px] font-semibold text-primary-foreground bg-primary rounded-full min-w-[18px] h-[18px] px-1.5 shrink-0">
              {chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
