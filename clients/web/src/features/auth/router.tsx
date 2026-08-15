import { routes } from "@/settings/routes";
import React from "react";
import VerifyEmail from "./pages/private/verify-email";

const SignIn = React.lazy(() => import("./pages/public/sign-in"));

const SignUp = React.lazy(() => import("./pages/public/sign-up"));

const Activation = React.lazy(() => import("./pages/private/activation"));

const ForgotPassword = React.lazy(
  () => import("./pages/private/forgot-password"),
);

const ResetPassword = React.lazy(
  () => import("./pages/private/reset-password"),
);

export const authRoutes = [
  {
    path: routes.auth.public.sign_in,
    element: <SignIn />,
  },
  {
    path: routes.auth.public.sign_up,
    element: <SignUp />,
  },
  {
    path: routes.auth.private.activation,
    element: <Activation />,
  },
  {
    path: routes.auth.private.forgot_password,
    element: <ForgotPassword />,
  },
  {
    path: routes.auth.private.reset_password,
    element: <ResetPassword />,
  },
  {
    path: routes.auth.private.verify_email,
    element: <VerifyEmail />,
  },
];
