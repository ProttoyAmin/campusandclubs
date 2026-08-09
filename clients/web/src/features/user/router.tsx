import { routes } from "@/settings/routes";
import React from "react";


const Profile = React.lazy(
    () => import("./pages/public/Profile")
)

export const userRoutes = [
    {   
        id: "user-profile",
        path: routes.user.public.profile,
        element: <Profile />
    }
]