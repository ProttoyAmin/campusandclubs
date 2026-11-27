import { routes } from "@/settings/routes";
import { pageTitle } from "../meta";
import type { RouteNode } from "../types";

/** Children of the NotificationLayout branch (noindex is set on the branch). */
export const notificationBranch: RouteNode[] = [
    {
        id: "notifications",
        path: routes.notification.base,
        page: () => import("@/features/notifications/pages"),
        meta: { title: pageTitle("Notifications") },
    },
    {
        id: "notification-requests",
        path: routes.notification.requests.base,
        page: () => import("@/features/notifications/pages/requests"),
        meta: { title: pageTitle("Requests") },
    },
];
