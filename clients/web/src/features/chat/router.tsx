import Chat from "./pages/chat";
import Chats from "./pages/chats";
import { routes } from "@/settings/routes";
import NewChat from "./pages/new-chat";
import ChatRequests from "./pages/chat-requests";

export const chatRoutes = [
    {
        id: "chat-all",
        path: routes.chat.chats,
        element: <Chats />,
    },
    {
        id: "inbox",
        path: routes.chat.inbox,
        element: <Chat />,
    },
    {
        id: "new",
        path: routes.chat.new,
        element: <NewChat />,
    },
    {
        id: "chat-requests",
        path: routes.chat.requests,
        element: <ChatRequests />,
    },
];
