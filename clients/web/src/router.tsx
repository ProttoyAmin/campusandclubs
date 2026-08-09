import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/main-layout";
import { routes } from "./settings/routes/__main__";
import { userRoutes, userSettingsRoutes } from "./features/user/router";
import { UserProfileLayout } from "@/layouts/user";
import { ClubMainLayout } from "./layouts/club";
import AuthLayout from "./layouts/auth/auth-layout";
import { clubRoutes } from "./features/club/router";
import { authRoutes } from "./features/auth/router";
import NotFound from "./shared/pages/not-found";
import SettingsLayout from "./layouts/settings-layout/settings-layout";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        id: "home",
        children: [{ path: routes.home, element: <App /> }],
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
      }
    ],
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
]);
