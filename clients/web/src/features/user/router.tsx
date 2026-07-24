import { routes } from "@/settings/routes";
import React from "react";


const Profile = React.lazy(
    () => import("./pages/public/profile")
)

export const userRoutes = [
    {
        path: routes.user.public.profile,
        element: <Profile />
    }
]