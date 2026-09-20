import EmptyState from "@/shared/components/empty-state";
import ChatList from "../components/chat-list";
import { useChats } from "../hooks/chat.hooks"

const ChatRequests = () => {
    const { pendingChats } = useChats();
    return (
        <div>
            {/* <pre>{JSON.stringify(pendingChats, null, 2)}</pre> */}
            {pendingChats.data?.length > 0 ? (
                <ChatList chats={pendingChats.data} />
            ) : (
                <EmptyState
                    title=""
                    description="No messages yet"
                />
            )}
        </div>
    )
}

export default ChatRequests