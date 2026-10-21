import Chat from "./pages/chat";
import { routes } from "@/settings/routes";
import ChatLayout from "@/layouts/chat/chat-layout";
import React from "react";
import ChatEmptyPlaceholder from "./components/chat-empty-placeholder";
import NewChat from "./pages/new-chat";
import { Navigate } from "react-router-dom";

const ChatInfo = React.lazy(() => import("./pages/chat-info"));

export const chatRoutes = [
    {
        id: "chat-root-no-slash",
        path: "/@/chats",
        element: <Navigate to={routes.chat.chats} replace />,
    },
    {
        id: "chat-root",
        path: routes.chat.chats,
        element: <ChatEmptyPlaceholder />,
    },
    {
        id: "chat-requests",
        path: routes.chat.requests,
        element: <ChatEmptyPlaceholder />,
    },
    {
        id: "chat-new-no-slash",
        path: "/@/chats/new",
        element: <Navigate to={routes.chat.new} replace />,
    },
    {
        id: "chat-new",
        path: routes.chat.new,
        element: <NewChat />,
    },
    {
        id: "inbox",
        path: routes.chat.inbox,
        element: <ChatLayout />,
        children: [
            {
                index: true,
                element: <Chat />,
            },
            {
                id: "chat-info",
                path: routes.chat.info,
                element: <ChatInfo />,
            },
        ],
    },
];
