import type { RouteObject } from "react-router-dom";
import { clubRoutes } from "./features/club/router";
import MainLayout from "./layouts/main-layout";
import { UserProfileLayout } from "./layouts/user";
import { userRoutes, userSettingsRoutes } from "./features/user/router";
import { ClubMainLayout } from "./layouts/club";
import SettingsLayout from "./layouts/settings-layout/settings-layout";
import AuthLayout from "./layouts/auth/auth-layout";
import { authRoutes } from "./features/auth/router";
import NotFound from "./shared/pages/not-found";
import App from "./App";
import { chatRoutes } from "./features/chat/router";
import { routes as AppRoute } from "./settings/routes";

import NotificationLayout from "./layouts/notification/notification-layout";
import { notificationRoutes } from "./features/notifications/router";
import AcceptInvitationPage from "./features/club/pages/public/invitation-page";
import ChatsShell from "./layouts/chat/shell";


export const routes: RouteObject[] = [
  {
    id: "base",
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        id: "user",
        element: <UserProfileLayout />,
        children: [...userRoutes],
      },
      {
        id: "club",
        element: <ClubMainLayout />,
        children: [...clubRoutes],
      },
      {
        id: "settings",
        element: <SettingsLayout />,
        children: [...userSettingsRoutes],
      },
      {
        id: "chats",
        element: <ChatsShell />,
        children: [...chatRoutes],
      },
      {
        id: "notification",
        element: <NotificationLayout />,
        children: [...notificationRoutes],
      }
    ]
  },
  {
    id: "club-invite",
    path: AppRoute.club.private.config.invites.accept,
    element: <AcceptInvitationPage />,
  },
  {
    id: "auth",
    element: <AuthLayout />,
    children: [...authRoutes],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];