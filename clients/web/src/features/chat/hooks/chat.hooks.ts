import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { chat } from "../services/chat.service";
import type { ChatStartDTO, Message } from "../http/chat.http";
import { queryClient } from "@/config/query-client";
import type { AppError } from "@/settings/app/error";


export const useChats = () => {
    const chats = useQuery({
        queryKey: ["chats"],
        queryFn: () => chat.list(),
    })

    const startChat = useMutation({
        mutationFn: (data: ChatStartDTO) => chat.start(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            })
        }
    })

    const pendingChats = useQuery({
        queryKey: ["chats", "pending"],
        queryFn: () => chat.pending(),
    })

    return {
        chats,
        startChat,
        pendingChats
    }
}

export const useChat = (chat_id: string) => {

    const chatDetail = useQuery({
        queryKey: ["chats", chat_id],
        queryFn: () => chat.get(chat_id),
    })

    const messagesData = useQuery({
        queryKey: ["chats", chat_id, "messages"],
        queryFn: () => chat.messages(chat_id),
    })

    const messageSend = useMutation({
        mutationFn: (data: { content: string }) => chat.message(chat_id, data),
    })

    const acceptPendingChat = useMutation({
        mutationFn: (chatId: string) => chat.accept_pending(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats", chat_id, "messages"],
            })
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            })
            queryClient.invalidateQueries({
                queryKey: ["chats", "pending"],
            })
        }
    })

    const declinePendingChat = useMutation({
        mutationFn: (chatId: string) => chat.decline_pending(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats", chat_id, "messages"],
            })
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            })
        }
    })

    const leaveChat = useMutation({
        mutationFn: (chatId: string) => chat.leave(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chats", "pending"],
            })
        }
    })

    return {
        chatDetail,
        messagesData,
        messageSend,
        acceptPendingChat,
        declinePendingChat,
        leaveChat
    }
}