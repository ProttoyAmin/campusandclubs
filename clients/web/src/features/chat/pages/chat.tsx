import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../hooks/chat.hooks";
import { useSession } from "@/features/auth/hooks";
import SendMessage from "../components/send-message";
import ChatIntro from "../components/chat-intro";
import ChatMessageList from "../components/chat-message-list";
import useChatOutlet from "../context/use-chat-outlet";
import { useChatSocket } from "../context/chat-socket-context";
import { Spinner } from "design/components/ui/spinner";
import type { Message } from "../http/chat.http";

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const { chats = [], isLoading } = useChatOutlet() ?? {};
  const { messages, messageSend, uploadMessage, markSeen, deleteMessage } = useChat(id as string);
  const [newMessage, setNewMessage] = useState<string>("");
  const { data: session } = useSession();
  const currentUserId = session?.data?.user?.id;
  const { joinChat } = useChatSocket();
  const joinedRef = useRef<string | null>(null);

  const currentChat = chats?.find((c) => c.id === id);
  const participants = currentChat?.participants?.filter((p) => p.id !== currentUserId) ?? [];
  const isGroup = currentChat?.type === "GROUP";

  // As soon as we have a chat id, explicitly join the WS room (defensive —
  // ChatSocketProvider already joins on route change, but this covers
  // first render and late connects).
  useEffect(() => {
    if (id && joinedRef.current !== id) {
      joinChat(id);
      joinedRef.current = id;
    }
  }, [id, joinChat]);

  // When the message list first loads (or we switch chats), mark the latest
  // non-self message as seen so the sender gets blue ticks when you open the
  // conversation. We use a ref to avoid re-firing on every re-render.
  const markedOpenRef = useRef<string | null>(null);
  useEffect(() => {
    if (!id || !messages.data) return;
    if (markedOpenRef.current === id) return;
    const list: Message[] = messages.data;
    const lastFromOther = list.slice().reverse().find((m) => m.sender.id !== currentUserId);
    if (lastFromOther && lastFromOther.my_status !== "seen") {
      markSeen.mutate(lastFromOther.id);
    }
    markedOpenRef.current = id;
  }, [id, messages.data, currentUserId, markSeen]);

  const sendMessage = useCallback(
    (opts?: { files?: File[] }) => {
      if (!id) return;
      const content = newMessage.trim();
      if (!content && (!opts?.files || opts.files.length === 0)) return;
      // Make sure we're in the WS room BEFORE firing the POST so the
      // broadcasted "chat:message:new" reaches us.
      joinChat(id);
      if (opts?.files && opts.files.length > 0) {
        uploadMessage.mutate({ content, files: opts.files });
      } else {
        messageSend.mutate({ content });
      }
      setNewMessage("");
    },
    [id, newMessage, messageSend, uploadMessage, joinChat],
  );

  const onVisibleLastMessage = useCallback(
    (msg: Message) => {
      if (msg.sender.id !== currentUserId && msg.my_status !== "seen") {
        markSeen.mutate(msg.id);
      }
    },
    [currentUserId, markSeen],
  );

  const onDeleteMessage = useCallback(
    (messageId: string) => {
      deleteMessage.mutate({ messageId, mode: "FOR_EVERYONE" });
    },
    [deleteMessage],
  );

  if (isLoading) return <Spinner className="mx-auto mt-20" />;
  const messageList: Message[] = messages.data ?? [];

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden min-h-0 p-2">
      <ChatMessageList
        messages={messageList}
        currentUserId={currentUserId}
        header={<ChatIntro participants={participants} isGroup={isGroup} />}
        onVisibleLastMessage={onVisibleLastMessage}
        onDeleteMessage={onDeleteMessage}
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
