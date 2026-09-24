import { useOutletContext } from 'react-router-dom';
import type { ChatResponse } from '../http/chat.http';
import type { AppError } from "@/settings/app/error";

type ChatOutletContext = {
    chats: ChatResponse[] | undefined;
    chatError: AppError<unknown>;
};

type ChatDetailOutletContext = {
    chat: ChatResponse | undefined;
    chatError: AppError<unknown>;
}

export const useDMOutlet = () => {
    return useOutletContext<ChatDetailOutletContext>();
}

export const useChatOutlet = () => {
    return useOutletContext<ChatOutletContext>();
}