/**
 * The application route tree, as authoring `RouteNode`s.
 *
 * Mirrors `src/routes.tsx` (same layouts, paths and ids) with these changes:
 * - a pathless `root` route owns <head> syncing and the top error boundary;
 * - pages load through React Router's route-level `lazy` (`page:`) so SSR
 *   resolves them before rendering and hydration never suspends;
 * - every branch declares `meta`; private branches are `noindex`;
 * - the catch-all answers with HTTP 404.
 *
 * Feature branches live in `./branches/*` so each feature owns its routes.
 * Call `createAppRoutes(runtime)` (./index.ts) to get RouteObjects.
 */
import App from "@/App";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth/auth-layout";
import { UserProfileLayout } from "@/layouts/user";
import { ClubMainLayout } from "@/layouts/club";
import SettingsLayout from "@/layouts/settings-layout/settings-layout";
import NotificationLayout from "@/layouts/notification/notification-layout";
import ChatsShell from "@/layouts/chat/shell";
import NotFound from "@/shared/pages/not-found";
import RouteErrorBoundary from "@/shared/pages/route-error-boundary";
import { routes } from "@/settings/routes";

import RootRoute from "./root";
import { pageTitle } from "./meta";
import type { RouteNode } from "./types";
import { authBranch } from "./branches/auth";
import { userBranch, settingsBranch } from "./branches/user";
import { clubBranch } from "./branches/club";
import { chatBranch } from "./branches/chat";
import { notificationBranch } from "./branches/notification";

const noindex = { robots: "noindex,nofollow" } as const;

export const appTree: RouteNode[] = [
    {
        id: "root",
        Component: RootRoute,
        ErrorBoundary: RouteErrorBoundary,
        children: [
            {
                id: "base",
                path: "/",
                Component: MainLayout,
                ErrorBoundary: RouteErrorBoundary,
                children: [
                    {
                        id: "home",
                        index: true,
                        Component: App,
                        meta: { title: pageTitle("Home") },
                    },
                    { id: "user", Component: UserProfileLayout, children: userBranch },
                    { id: "club", Component: ClubMainLayout, children: clubBranch },
                    {
                        id: "settings",
                        Component: SettingsLayout,
                        meta: noindex,
                        children: settingsBranch,
                    },
                    {
                        id: "chats",
                        Component: ChatsShell,
                        meta: noindex,
                        children: chatBranch,
                    },
                    {
                        id: "notification",
                        Component: NotificationLayout,
                        meta: noindex,
                        children: notificationBranch,
                    },
                ],
            },
            {
                id: "club-invite",
                path: routes.club.private.config.invites.accept,
                page: () => import("@/features/club/pages/public/invitation-page"),
                ErrorBoundary: RouteErrorBoundary,
                meta: { title: pageTitle("Club invitation"), ...noindex },
            },
            {
                id: "auth",
                Component: AuthLayout,
                ErrorBoundary: RouteErrorBoundary,
                children: authBranch,
            },
            {
                id: "not-found",
                path: "*",
                Component: NotFound,
                handle: { status: 404 },
                meta: { title: pageTitle("Page not found"), ...noindex },
            },
        ],
    },
];
