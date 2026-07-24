import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/main-layout";
import { routes } from "./settings/routes/__main__";
import { userRoutes } from "./features/user/router";
import { UserProfileLayout } from "@/layouts/user";
import { ClubMainLayout } from "./layouts/club";
import AuthLayout from "./layouts/auth/auth-layout";
import { clubRoutes } from "./features/club/router";
import { authRoutes } from "./features/auth/router";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        element: <MainLayout />,
        children: [{ path: routes.home, element: <App /> }],
      },

      {
        element: <AuthLayout />,
        children: [...authRoutes],
      },

      {
        element: <UserProfileLayout />,
        children: [...userRoutes],
      },

      {
        element: <ClubMainLayout />,
        children: [...clubRoutes],
      },
    ],
  },
]);
