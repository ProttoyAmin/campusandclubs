import { redirect } from "react-router-dom";
import { routes } from "@/settings/routes";
import ChatEmptyPlaceholder from "@/features/chat/components/chat-empty-placeholder";
import { pageTitle } from "../meta";
import type { RouteNode } from "../types";

/**
 * Children of the ChatsShell branch (noindex is set on the branch).
 *
 * The no-trailing-slash aliases use loader redirects instead of <Navigate>,
 * so SSR answers with a real 302 instead of rendering a page that only
 * redirects after hydration.
 */
export const chatBranch: RouteNode[] = [
    {
        id: "chat-root-no-slash",
        path: "/@/chats",
        loader: () => redirect(routes.chat.chats),
    },
    {
        id: "chat-root",
        path: routes.chat.chats,
        Component: ChatEmptyPlaceholder,
        meta: { title: pageTitle("Chats") },
    },
    {
        id: "chat-requests",
        path: routes.chat.requests,
        Component: ChatEmptyPlaceholder,
        meta: { title: pageTitle("Message requests") },
    },
    {
        id: "chat-new-no-slash",
        path: "/@/chats/new",
        loader: () => redirect(routes.chat.new),
    },
    {
        id: "chat-new",
        path: routes.chat.new,
        page: () => import("@/features/chat/pages/new-chat"),
        meta: { title: pageTitle("New message") },
    },
    {
        id: "inbox",
        path: routes.chat.inbox,
        page: () => import("@/layouts/chat/chat-layout"),
        meta: { title: pageTitle("Chat") },
        children: [
            {
                id: "chat-inbox",
                index: true,
                page: () => import("@/features/chat/pages/chat"),
            },
            {
                id: "chat-info",
                path: routes.chat.info,
                page: () => import("@/features/chat/pages/chat-info"),
                meta: { title: pageTitle("Chat info") },
            },
        ],
    },
];
