import type { RouteObject } from "react-router-dom";
import { routes as appRoutes } from "./settings/routes";
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
    ]
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