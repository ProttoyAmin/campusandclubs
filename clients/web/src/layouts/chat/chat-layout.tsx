import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { useChat } from "@/features/chat/hooks/chat.hooks";
import ChatLayoutHeader from "@/features/chat/components/layout/layout-header";
import { useSession } from "@/features/auth/hooks";
import { Spinner } from "design/components/ui/spinner";
import { ChatProvider } from "@/features/chat/context/use-chat-context";

const ChatLayout = () => {
    const [replying, setReplying] = React.useState(false);
    const { id } = useParams();
    const { chatDetail } = useChat(id!);
    const { data: session } = useSession();

    const currentUserId = session?.data?.user?.id;

    if (chatDetail.isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Spinner />
            </div>
        );
    }

    return (
        <ChatProvider>
            <div className="flex flex-col h-full w-full overflow-hidden">
                <div className="px-4 py-2 shrink-0 sticky top-0 bg-background/80 backdrop-blur z-10">
                    <ChatLayoutHeader
                        chat={chatDetail.data?.data}
                        currentUserId={currentUserId}
                    />
                </div>
                <div className="flex-1 overflow-hidden min-h-0">
                    <Outlet
                        context={{
                            chat: chatDetail.data?.data,
                            chatError: chatDetail.error,
                            isLoading: chatDetail.isLoading,
                            replying,
                            setReplying,
                        }}
                    />
                </div>
            </div>
        </ChatProvider>
    );
};

export default ChatLayout;
