import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useChat, chatKeys } from "../hooks/chat.hooks";
import { useSession } from "@/features/auth/hooks";
import SendMessage from "../components/send-message";
import ChatIntro from "../components/chat-intro";
import ChatMessageList from "../components/chat-message-list";
import useChatOutlet from "../context/use-chat-outlet";
import { Spinner } from "design/components/ui/spinner";
import { queryClient } from "@/config/query-client";
import type { Message } from "../http/chat.http";

const Chat = () => {
  const { id } = useParams();
  const { chats } = useChatOutlet();
  const chatId = id as string;
  const { messages, messageSend, uploadMessage, deleteMessage, markSeen } = useChat(chatId);
  const [newMessage, setNewMessage] = useState<string>("");
  const { data: session } = useSession();
  const currentUserId = session?.data?.user?.id;

  const currentChat = (chats ?? []).find((c) => c.id === chatId);
  const participants = currentChat?.participants.filter((p) => p.id !== currentUserId) ?? [];
  const isGroup = currentChat?.type === "GROUP";

  const sendMessage = (opts?: { files?: File[] }) => {
    const content = newMessage.trim();
    if (!content && (!opts?.files || opts.files.length === 0)) return;
    if (opts?.files && opts.files.length > 0) {
      uploadMessage.mutate({ content, files: opts.files });
    } else {
      messageSend.mutate({ content });
    }
    setNewMessage("");
  };

  const onDelete = useCallback(
    (messageId: string) => {
      deleteMessage.mutate({ messageId, mode: "FOR_EVERYONE" });
    },
    [deleteMessage],
  );

  const onVisible = useCallback(
    (msg: Message) => {
      if (msg.sender.id !== currentUserId) markSeen.mutate(msg.id);
    },
    [currentUserId, markSeen],
  );

  // When the chat first loads, mark the last message seen.
  useEffect(() => {
    const last = (messages.data ?? []).slice(-1)[0];
    if (last && last.sender.id !== currentUserId) {
      markSeen.mutate(last.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, messages.data?.length]);

  if (messages.isLoading && !messages.data) {
    return <Spinner className="mx-auto mt-20" />;
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden min-h-0 p-2">
      <ChatMessageList
        messages={messages.data ?? []}
        currentUserId={currentUserId}
        header={<ChatIntro participants={participants} isGroup={isGroup} />}
        onVisibleLastMessage={onVisible}
        onDeleteMessage={onDelete}
      />
      <SendMessage
        message={newMessage}
        setMessage={setNewMessage}
        sendMessage={sendMessage}
        isSending={messageSend.isPending || uploadMessage.isPending}
      />
    </div>
  );
};

export default Chat;
