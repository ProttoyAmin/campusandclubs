import { routes } from "@/settings/routes";
import React from "react";
import RequestsNotificationPage from "./pages/requests";



const NotifcationBase = React.lazy(() => import("./pages"));


export const notificationRoutes = [
    {
        id: "notifications",
        path: routes.notification.base,
        element: <NotifcationBase />,
    },
    {
        id: "requests",
        path: routes.notification.requests.base,
        element: <RequestsNotificationPage />,
    },
]