import { useSocketEvent } from "@/shared/hooks/use-socket-event";
import ChatsLayout from "./chats-layout";
import { queryClient } from "@/config/query-client";

const ChatsShell = () => {
    useSocketEvent("chat:message", (data) => {
        console.log("data from socket event", data);
        queryClient.invalidateQueries({
            queryKey: ["chats"],
        });
    });

    useSocketEvent("chat:start", (data) => {
        console.log("data from socket event chat:start", data);
        queryClient.invalidateQueries({
            queryKey: ["chats"],
        });
    });

    return <ChatsLayout />;
};


export default ChatsShell