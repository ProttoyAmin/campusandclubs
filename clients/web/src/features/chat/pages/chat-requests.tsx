import EmptyState from "@/shared/components/empty-state";
import ChatList from "../components/chat-list";
import { useChats } from "../hooks/chat.hooks";
import { useNavigate } from "react-router-dom";
import { routes } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { Spinner } from "design/components/ui/spinner";

const ChatRequests = () => {
    const { pendingChats } = useChats();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b shrink-0 sticky top-0 bg-background/80 backdrop-blur z-10">
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => navigate(routes.chat.chats)}
                >
                    <ArrowLeftIcon className="size-5" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold leading-tight">Message requests</h2>
                    <p className="text-xs text-muted-foreground">Messages from people you may know</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {pendingChats.isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Spinner />
                    </div>
                ) : (pendingChats.data?.length ?? 0) > 0 ? (
                    <div className="mt-2">
                        <ChatList chats={pendingChats.data ?? []} />
                    </div>
                ) : (
                    <div className="p-8">
                        <EmptyState
                            title="No message requests"
                            description="You don't have any message requests right now."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRequests;