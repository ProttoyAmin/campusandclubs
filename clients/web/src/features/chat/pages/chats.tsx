import { MessageAdd02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import EmptyState from "@/shared/components/empty-state";
import { Button } from "design/components/ui/button";
import { useNavigate } from "react-router-dom";
import { routes } from "@/settings/routes";
import { useChatOutlet } from "../context/use-chat-outlet";
import ChatList from "../components/chat-list";
import { Spinner } from "design/components/ui/spinner";
import type { ChatResponse } from "../http/chat.http";

type ChatsProps = {
    chats?: ChatResponse[];
    isLoading?: boolean;
};

const Chats = ({ chats: propChats, isLoading: propIsLoading }: ChatsProps) => {
    const outletCtx = useChatOutlet();
    const navigate = useNavigate();

    const chats = propChats ?? outletCtx?.chats ?? [];
    const isLoading = propIsLoading ?? outletCtx?.isLoading ?? false;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 shrink-0 sticky top-0 bg-background/80 backdrop-blur z-10">
                <h2 className="text-xl font-bold tracking-tight">
                    Chats
                </h2>

                <div className="flex items-center gap-1.5">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs font-medium px-3"
                        onClick={() => navigate(routes.chat.requests)}
                    >
                        Requests
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full size-9"
                        onClick={() => navigate(routes.chat.new)}
                        title="New Chat"
                    >
                        <HugeiconsIcon
                            icon={MessageAdd02Icon}
                            className="size-4"
                        />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Spinner />
                    </div>
                ) : chats && chats.length > 0 ? (
                    <div className="mt-2">
                        <ChatList chats={chats} />
                    </div>
                ) : (
                    <div className="p-8">
                        <EmptyState
                            title="No messages yet"
                            description="Start a new conversation with someone from your clubs or campus."
                        >
                            <Button
                                variant="outline"
                                className="rounded-full mt-2"
                                onClick={() => navigate(routes.chat.new)}
                            >
                                Start chatting
                            </Button>
                        </EmptyState>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chats;