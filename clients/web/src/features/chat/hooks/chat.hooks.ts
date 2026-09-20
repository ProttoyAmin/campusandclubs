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

    return {
        chats,
        startChat
    }
}

export const useChat = (chat_id: string) => {
    const messages = useQuery
        ({
            queryKey: ["chats", chat_id],
            queryFn: () => chat.messages(chat_id),
        })

    const messageSend = useMutation({
        mutationFn: (data: { content: string }) => chat.message(chat_id, data),
        // onSuccess: () => {
        //     queryClient.invalidateQueries({
        //         queryKey: ["chats", chat_id],
        //     })
        // }
    })

    return {
        messages,
        messageSend
    }
}