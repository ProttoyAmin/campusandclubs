import { useEffect, useRef } from "react";
import ChatMessageBubble from "./chat-message-bubble";
import type { Message as MessageT } from "../http/chat.http";
import type { ReactNode } from "react";

interface ChatMessageListProps {
  messages: MessageT[];
  currentUserId?: string;
  header?: ReactNode;
  onVisibleLastMessage?: (message: MessageT) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const groupBySender = (messages: MessageT[]): MessageT[][] => {
  const groups: MessageT[][] = [];
  for (const message of messages) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup[0].sender.id === message.sender.id) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }
  }
  return groups;
};

const ChatMessageList = ({
  messages,
  currentUserId,
  header,
  onVisibleLastMessage,
  onDeleteMessage,
}: ChatMessageListProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // The message array from the API comes in natural order (oldest-first)
  // for cursor pages, but we render newest-at-bottom using flex-col-reverse
  // so that "first in DOM = bottom of screen".
  const ordered = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const groups = groupBySender(ordered);
  const newest = ordered[ordered.length - 1];

  // When the newest message from the current user renders, auto-mark it seen.
  useEffect(() => {
    if (!newest || !onVisibleLastMessage) return;
    if (newest.sender.id === currentUserId) {
      onVisibleLastMessage(newest);
    }
  }, [newest?.id, currentUserId, onVisibleLastMessage]);

  return (
    <div
      ref={sentinelRef}
      className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse gap-2.5 scrollbar-none px-2"
    >
      {groups.map((group) => (
        <ChatMessageBubble
          key={group[0].id}
          messages={group}
          isOwn={group[0].sender.id === currentUserId}
          onDelete={onDeleteMessage}
        />
      ))}
      {header}
    </div>
  );
};

export default ChatMessageList;
