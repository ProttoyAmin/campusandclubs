import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/config/query-client";
import { chat } from "../services/chat.service";
import type { ChatResponse, ChatStartDTO, Message, MessageSendDTO } from "../http/chat.http";
import type { AppError } from "@/settings/app/error";

// ─────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────
export const chatKeys = {
    all: ["chats"] as const,
    lists: () => [...chatKeys.all, "list"] as const,
    requests: () => [...chatKeys.all, "requests"] as const,
    messages: (chatId: string) => [...chatKeys.all, "messages", chatId] as const,
};

export const useChats = () => {
    const qc = useQueryClient();
    const chats = useQuery<ChatResponse[], AppError>({
        queryKey: chatKeys.lists(),
        queryFn: async () => (await chat.list()).data,
    });

    const startChat = useMutation({
        mutationFn: (data: ChatStartDTO) => chat.start(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: chatKeys.lists() });
            qc.invalidateQueries({ queryKey: chatKeys.requests() });
        },
    });

    const createGroup = useMutation({
        mutationFn: (data: { name: string; participant_ids: string[]; description?: string }) =>
            chat.createGroup(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.lists() }),
    });

    const startDirect = useMutation({
        mutationFn: (participantId: string) => chat.startDirect(participantId),
        onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.lists() }),
    });

    const pendingChats = useQuery({
        queryKey: chatKeys.requests(),
        queryFn: async () => (await chat.pending()).data,
    });

    return { chats, startChat, createGroup, startDirect, pendingChats };
};

export const useChat = (chat_id: string) => {
    const qc = useQueryClient();

    const messages = useQuery<Message[], AppError>({
        queryKey: chatKeys.messages(chat_id),
        queryFn: async () => (await chat.messages(chat_id)).data,
        enabled: Boolean(chat_id),
    });

    const messageSend = useMutation({
        mutationFn: (data: MessageSendDTO) => chat.message(chat_id, data),
        onSuccess: (resp) => {
            qc.setQueryData<Message[]>(chatKeys.messages(chat_id), (old) => {
                if (!old) return [resp.data];
                return [...old, resp.data];
            });
            qc.invalidateQueries({ queryKey: chatKeys.lists() });
        },
    });

    const uploadMessage = useMutation({
        mutationFn: (payload: { content: string; files?: File[]; reply_to?: string }) =>
            chat.uploadMessage(chat_id, payload),
        onSuccess: (resp) => {
            qc.setQueryData<Message[]>(chatKeys.messages(chat_id), (old) => {
                if (!old) return [resp.data];
                return [...old, resp.data];
            });
            qc.invalidateQueries({ queryKey: chatKeys.lists() });
        },
    });

    const editMessage = useMutation({
        mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
            chat.edit(messageId, content),
        onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(chat_id) }),
    });

    const deleteMessage = useMutation({
        mutationFn: ({ messageId, mode }: { messageId: string; mode?: "FOR_ME" | "FOR_EVERYONE" }) =>
            chat.deleteMessage(messageId, mode),
        onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(chat_id) }),
    });

    const react = useMutation({
        mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
            chat.react(messageId, emoji),
        onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.messages(chat_id) }),
    });

    const markSeen = useMutation({
        mutationFn: (messageId: string) => chat.markSeen(chat_id, messageId),
    });


    return { messages, messageSend, uploadMessage, editMessage, deleteMessage, react, markSeen };
};
