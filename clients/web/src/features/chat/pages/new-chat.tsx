import { useEffect, useState } from "react";
import UsersSearchInput from "@/features/user/components/users-search-input";
import type { UserMinimal } from "@campus/api";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "design/components/ui/avatar";
import SendMessage from "../components/send-message";
import { useChats } from "../hooks/chat.hooks";
import { chat } from "../services/chat.service";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/settings/routes";

const NewChat = () => {
  const location = useLocation();
  const initialUser = (location.state as { initialUser?: UserMinimal } | null)?.initialUser;
  const [users, setUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
  const [selectedUsers, setSelectedUsers] = useState<UserMinimal[]>(initialUser ? [initialUser] : []);
  const [message, setMessage] = useState("");
  const pageHeader = usePageHeader();
  const { startChat, startDirect, createGroup } = useChats();
  const navigate = useNavigate();

  useEffect(() => {
    const id = pageHeader.push(
      <div className="flex items-center gap-4">
        <NavigateButtons hideForward />
        <h1 className="text-lg font-semibold">New Chat</h1>
      </div>,
    );
    return () => pageHeader.pop(id);
  }, [pageHeader]);

  const handleSend = (opts?: { files?: File[] }) => {
    const content = message.trim();
    if (selectedUsers.length === 1) {
      startDirect.mutateAsync(selectedUsers[0].id)
        .then((resp) => {
          const chatId = resp.data.id;
          if (content || (opts?.files && opts.files.length)) {
            const p = opts?.files && opts.files.length
              ? chat.uploadMessage(chatId, { content, files: opts.files })
              : chat.message(chatId, { content });
            return p.then(() => chatId);
          }
          return chatId;
        })
        .then((chatId) => navigate(paths.private.chat.inbox(chatId)));
      return;
    }
    createGroup.mutateAsync(
      { name: selectedUsers.map((u) => u.username).join(", "), participant_ids: selectedUsers.map((u) => u.id) },
    )
      .then((resp) => {
        const chatId = resp.data.id;
        if (content || (opts?.files && opts.files.length)) {
          const p = opts?.files && opts.files.length
            ? chat.uploadMessage(chatId, { content, files: opts.files })
            : chat.message(chatId, { content });
          return p.then(() => chatId);
        }
        return chatId;
      })
      .then((chatId) => navigate(paths.private.chat.inbox(chatId)));
  };

  const MAX_VISIBLE = 2;

  return (
    <div className="grid grid-rows-[auto_1fr] h-full w-full overflow-hidden p-2">
      <UsersSearchInput users={users} setUsers={setUsers} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
      {selectedUsers.length > 0 && (
        <>
          <div className="flex flex-col items-center justify-center gap-4 mt-6">
            <AvatarGroup>
              {selectedUsers.slice(0, MAX_VISIBLE).map((user) => (
                <Avatar key={user.id} size="2xl">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {selectedUsers.length > MAX_VISIBLE && (
                <AvatarGroupCount>+{selectedUsers.length - MAX_VISIBLE}</AvatarGroupCount>
              )}
            </AvatarGroup>
            <span className="text-muted-foreground">
              {selectedUsers.length > 1
                ? selectedUsers.map((u) => u.username).join(", ")
                : selectedUsers[0]?.username}
            </span>
          </div>
          <div className="mt-auto">
            <SendMessage
              message={message}
              setMessage={setMessage}
              sendMessage={handleSend}
              isSending={startChat.isPending || startDirect.isPending || createGroup.isPending}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NewChat;
