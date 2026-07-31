import { routes } from "@/settings/routes";
import React from "react";


const SignIn = React.lazy(
    () => import("./pages/public/sign-in")
)

const SignUp = React.lazy(
    () => import("./pages/public/sign-up")
)

const Activation = React.lazy(
    () => import("./pages/private/activation")
)


export const authRoutes = [
    {
        path: routes.auth.public.sign_in,
        element: <SignIn />
    },
    {
        path: routes.auth.public.sign_up,
        element: <SignUp />
    },
    {
        path: routes.auth.private.activation,
        element: <Activation />
    }
]