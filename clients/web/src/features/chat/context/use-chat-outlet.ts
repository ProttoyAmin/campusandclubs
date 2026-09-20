import { useOutletContext } from 'react-router-dom';
import type { ChatResponse } from '../http/chat.http';
import type { AppError } from "@/settings/app/error";

type ChatOutletContext = {
    chats: ChatResponse[] | undefined;
    chatError: AppError<unknown>;
};

const useChatOutlet = () => {
    return useOutletContext<ChatOutletContext>();
}

export default useChatOutlet