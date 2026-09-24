import Chat from "./pages/chat";
import Chats from "./pages/chats";
import { routes } from "@/settings/routes";
import NewChat from "./pages/new-chat";
import ChatRequests from "./pages/chat-requests";
import ChatLayout from "@/layouts/chat/chat-layout";
import React from "react";


const ChatInfo = React.lazy(() => import("./pages/chat-info"));

export const chatRoutes = [
    {
        id: "chat-all",
        path: routes.chat.chats,
        element: <Chats />,
    },
    {
        id: "inbox",
        path: routes.chat.inbox,
        element: <ChatLayout />,
        children: [
            {
                index: true,
                path: routes.chat.inbox,
                element: <Chat />,
            },
            {
                id: "chat-info",
                path: routes.chat.info,
                element: <ChatInfo />
            }
        ]
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
