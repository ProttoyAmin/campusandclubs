import { useOutletContext } from 'react-router-dom';
import type { ChatResponse } from '../http/chat.http';
import type { AppError } from "@/settings/app/error";

export type ChatOutletContext = {
    chats: ChatResponse[] | undefined;
    chatError?: AppError<unknown>;
    isLoading: boolean;
};

export type ChatDetailOutletContext = {
    chat: ChatResponse | undefined;
    chatError?: AppError<unknown>;
    isLoading: boolean;
    replying: boolean;
    setReplying: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useDMOutlet = () => {
    return useOutletContext<ChatDetailOutletContext>();
};

export const useChatOutlet = () => {
    const context = useOutletContext<ChatOutletContext>();
    return context ?? { chats: [], isLoading: false };
};