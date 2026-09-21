import EmptyState from "@/shared/components/empty-state";
import ChatList from "../components/chat-list";
import { useChats } from "../hooks/chat.hooks";

const ChatRequests = () => {
    const { pendingChats } = useChats();
    console.log(pendingChats.data?.data);
    const pendingList = pendingChats.data?.data ?? [];

    return (
        <div>
            {pendingList.length > 0 ? (
                <>
                    <ChatList chats={pendingList} />
                    <pre>{JSON.stringify(pendingList, null, 2)}</pre>
                </>
            ) : (
                <EmptyState
                    title=""
                    description="No messages yet"
                />
            )}
        </div>
    );
};

export default ChatRequests;
