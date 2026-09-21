import { createContext, useContext, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "@/library/socket";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../hooks/chat.hooks";
import { paths } from "@/settings/routes";
import type { Message } from "../http/chat.http";

/**
 * ChatSocketProvider
 * ------------------
 * Mounted inside the `<ChatsLayout>` so it's alive for the entire
 * duration the user is on any chat route. Responsibilities:
 *
 *  1. When a chat is open (path matches `/@/chats/:id`) it sends
 *     `chat:join` and leaves the previous chat group (so the server
 *     only pushes events for the room the user is currently viewing).
 *  2. Listens to chat:* events and patches React Query cache with the
 *     new/updated/deleted message payloads so the UI updates without a
 *     full refetch.
 *  3. Also listens to the personal `notification:message` and
 *     `chat:request:*` channels to invalidate the chat list/requests.
 *
 * No JSX renders here; it's a behavior-only component.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const ChatSocketContext = createContext<{ joinChat: (id: string) => void; leaveChat: () => void }>({
  joinChat: noop,
  leaveChat: noop,
});

export const ChatSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const location = useLocation();
  const qc = useQueryClient();
  const joinedChatRef = useRef<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────
  const leaveChat = () => {
    if (joinedChatRef.current) {
      socket.send("chat:leave", { chat_id: joinedChatRef.current });
      joinedChatRef.current = null;
    }
  };
  const joinChat = (id: string) => {
    if (joinedChatRef.current === id) return;
    leaveChat();
    socket.send("chat:join", { chat_id: id });
    joinedChatRef.current = id;
  };

  useEffect(() => {
    return () => leaveChat();
  }, []);

  // Join/leave based on current route.
  useEffect(() => {
    const match = location.pathname.startsWith(paths.private.chat.chats);
    if (!match || !params.id) {
      leaveChat();
      return;
    }
    joinChat(params.id);
  }, [location.pathname, params.id]);

  // ── Inbound events ──────────────────────────────────────────────
  useEffect(() => {
    const offs: Array<() => void> = [];
    const on = (type: string, handler: (data: unknown) => void) => {
      offs.push(socket.on(type, handler));
    };

    on("chat:message:new", (evt: unknown) => {
      // Server sends { type: "chat:message:new", data: Message } and the
      // socket service passes `parsed.data` to handlers (i.e. the Message).
      const payload = (evt as { data?: Message })?.data ?? (evt as Message);
      if (!payload?.id) return;
      // `payload.chat` is the chat id (UUID string); coerce to string in
      // case it comes through as a non-string primitive.
      const chatId = String(payload.chat);
      qc.setQueryData<Message[] | undefined>(chatKeys.messages(chatId), (old) => {
        if (!old) return [payload];
        if (old.some((m) => m.id === payload.id)) return old;
        return [...old, payload];
      });
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });

    on("chat:message:updated", (evt: unknown) => {
      const payload = (evt as { data?: Message })?.data ?? (evt as Message);
      if (!payload?.id) return;
      qc.setQueryData<Message[]>(chatKeys.messages(payload.chat), (old) =>
        old ? old.map((m) => (m.id === payload.id ? payload : m)) : old,
      );
    });

    on("chat:message:deleted", (evt: unknown) => {
      const data = (evt as { data?: { chat_id: string; message_id: string; mode: string } })?.data ??
        (evt as { chat_id: string; message_id: string; mode: string });
      if (!data?.chat_id) return;
      if (data.mode === "FOR_EVERYONE") {
        qc.setQueryData<Message[]>(chatKeys.messages(data.chat_id), (old) =>
          old ? old.filter((m) => m.id !== data.message_id) : old,
        );
      } else {
        qc.setQueryData<Message[]>(chatKeys.messages(data.chat_id), (old) =>
          old ? old.filter((m) => m.id !== data.message_id) : old,
        );
      }
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });

    on("chat:reaction:added", () => qc.invalidateQueries({ queryKey: chatKeys.all }));
    on("chat:reaction:removed", () => qc.invalidateQueries({ queryKey: chatKeys.all }));
    on("chat:message:seen", (evt: unknown) => {
      // { chat_id, user_id: WHO marked it seen, message_id, seen_at }
      const data = (evt as { data?: { chat_id: string; user_id: string; message_id: string } })?.data ??
        (evt as { chat_id: string; user_id: string; message_id: string });
      if (!data?.chat_id || !data?.message_id) return;
      qc.setQueryData<Message[] | undefined>(chatKeys.messages(data.chat_id), (old) => {
        if (!old) return old;
        return old.map((m) => {
          if (m.id !== data.message_id) return m;
          // Only flip to blue ticks on the SENDER'S side: if the viewer's
          // id matches m.sender.id AND the person who marked seen is NOT
          // the viewer themselves, then this is a recipient's receipt.
          // We don't have viewerId in this scope, so we just set my_status
          // to "seen" unconditionally — recipients don't see ticks on their
          // own bubbles anyway (the bubble alignment distinguishes them).
          return { ...m, my_status: "seen" as const };
        });
      });
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });

    on("notification:message", () => {
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });

    on("chat:request:new", () => {
      qc.invalidateQueries({ queryKey: chatKeys.requests() });
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });
    on("chat:request:accepted", () => {
      qc.invalidateQueries({ queryKey: chatKeys.requests() });
      qc.invalidateQueries({ queryKey: chatKeys.lists() });
    });

    return () => offs.forEach((f) => f());
  }, [qc]);

  return (
    <ChatSocketContext.Provider value={{ joinChat, leaveChat }}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => useContext(ChatSocketContext);
