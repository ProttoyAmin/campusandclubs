import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type SetStateAction,
    type ReactNode
} from "react";
import type { Message } from "../http/chat.http";
import React from "react";

export type ReplyMessage = Pick<
    Message,
    "id" |
    "sender" |
    "content"
> | null

type ChatContextType = {
    replying: ReplyMessage;
    setReplying: Dispatch<SetStateAction<ReplyMessage>>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [replying, setReplying] = useState<ReplyMessage>(null);

    const value: ChatContextType = React.useMemo(
        () => ({
            replying,
            setReplying
        }), [replying]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);

    if (!context) {
        throw new Error("useChatContext must be used within ChatProvider");
    }

    return context;
}