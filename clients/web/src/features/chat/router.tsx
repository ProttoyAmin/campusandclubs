import Chat from "./pages/chat";
import Chats from "./pages/chats";
import { routes } from "@/settings/routes";
import NewChat from "./pages/new-chat";

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
];
