import ChatBox from "./chat-box";
import { type ChatResponse } from "../http/chat.http";
import { useNavigate } from "react-router-dom";
import { paths } from "@/settings/routes";
import { cn } from "design/lib/utils";

interface ChatListProps {
  chats: ChatResponse[];
  activeId?: string;
  currentUserId?: string;
  className?: string;
}

const ChatList = ({ chats, activeId, currentUserId, className }: ChatListProps) => {
  const navigate = useNavigate();
  return (
    <div className={cn("flex flex-col", className)}>
      {chats?.map((chat) => (
        <div
          key={chat.id}
          className="cursor-pointer"
          onClick={() => navigate(paths.private.chat.inbox(chat.id))}
        >
          <ChatBox chat={chat} active={activeId === chat.id} currentUserId={currentUserId} />
        </div>
      ))}
    </div>
  );
};

export default ChatList;
