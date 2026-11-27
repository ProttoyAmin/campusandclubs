import { routes } from "@/settings/routes";
import { pageTitle } from "../meta";
import type { RouteNode } from "../types";

const noindex = { robots: "noindex,nofollow" } as const;

/** Children of the pathless AuthLayout branch. */
export const authBranch: RouteNode[] = [
    {
        id: "auth-sign-in",
        path: routes.auth.public.sign_in,
        page: () => import("@/features/auth/pages/public/sign-in"),
        meta: { title: pageTitle("Sign in"), description: "Sign in to Campus and Clubs." },
    },
    {
        id: "auth-sign-up",
        path: routes.auth.public.sign_up,
        page: () => import("@/features/auth/pages/public/sign-up"),
        meta: { title: pageTitle("Sign up"), description: "Create your Campus and Clubs account." },
    },
    {
        id: "auth-social-callback",
        path: routes.auth.public.social_callback,
        page: () => import("@/features/auth/pages/public/social-callback"),
        meta: { title: pageTitle("Signing you in"), ...noindex },
    },
    {
        id: "auth-activation",
        path: routes.auth.private.activation,
        page: () => import("@/features/auth/pages/private/activation"),
        meta: { title: pageTitle("Activate account"), ...noindex },
    },
    {
        id: "auth-forgot-password",
        path: routes.auth.private.forgot_password,
        page: () => import("@/features/auth/pages/private/forgot-password"),
        meta: { title: pageTitle("Forgot password"), ...noindex },
    },
    {
        id: "auth-reset-password",
        path: routes.auth.private.reset_password,
        page: () => import("@/features/auth/pages/private/reset-password"),
        meta: { title: pageTitle("Reset password"), ...noindex },
    },
    {
        id: "auth-reset-password-otp",
        path: routes.auth.public.reset_password_otp,
        page: () => import("@/features/auth/pages/public/verify-password-reset-otp"),
        meta: { title: pageTitle("Verify code"), ...noindex },
    },
    {
        id: "auth-verify-email",
        path: routes.auth.private.verify_email,
        page: () => import("@/features/auth/pages/private/verify-email"),
        meta: { title: pageTitle("Verify email"), ...noindex },
    },
    {
        id: "auth-verify-email-otp",
        path: routes.auth.private.verify_email_otp,
        page: () => import("@/features/auth/pages/private/verify-email-otp"),
        meta: { title: pageTitle("Verify email"), ...noindex },
    },
];
