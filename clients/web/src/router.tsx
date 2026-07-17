import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/main-layout";
import { routes } from "./settings/routes/__main__";
import { userRoutes } from "./features/user/router";


export const router = createBrowserRouter([
    ...userRoutes,
    {
        element: <MainLayout />,
        children: [
            { path: routes.home, element: <App /> }
        ]
    }
])