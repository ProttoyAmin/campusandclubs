/**
 * Typed route node tree — SINGLE SOURCE OF TRUTH for the router.
 *
 * Auth subtree only for the first cut. Other features will be migrated
 * into the app-shell subtree over time.
 *
 * Structure (flat top-level list — compiled into a RouteObject[]):
 *   • /auth/*        → AuthLayout (sign-in, sign-up, forgot/reset/verify)
 *   • /activate/:uuid/:token → Activation page (no layout)
 *   • /*             → MainLayout (app shell) → NotFound splat
 *
 * This keeps auth pages OUT of MainLayout (sidebar/socket/guards) and
 * the app shell separate, which matches the production intent.
 */
import React from "react";
import type { RouteNode } from "./tree";
import MainLayout from "@/layouts/main-layout";
import AuthLayout from "@/layouts/auth/auth-layout";
import SignInPage from "@/features/auth/pages/public/sign-in";
import SignUpPage from "@/features/auth/pages/public/sign-up";
import SocialAuthCallback from "@/features/auth/pages/public/social-callback";
import ForgotPasswordPage from "@/features/auth/pages/private/forgot-password";
import ResetPasswordPage from "@/features/auth/pages/private/reset-password";
import VerifyEmailByKeyPage from "@/features/auth/pages/private/verify-email";
import VerifyEmailOtpPage from "@/features/auth/pages/private/verify-email-otp";
import ActivationPage from "@/features/auth/pages/private/activation";
import NotFound from "@/shared/pages/not-found";
import { paths } from "@/settings/routes";
import { withAppName } from "@/lib/router/meta";
import type { RouteObject } from "react-router-dom";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip a prefix like `/auth/` from a route constant to make it relative. */
const strip = (full: string, prefix: string) =>
  full.startsWith(prefix) ? full.slice(prefix.length) : full.replace(/^\//, "");

// ---------------------------------------------------------------------------
// Auth subtree (mounted at /auth/* — NO MainLayout)
// ---------------------------------------------------------------------------

const signInPath = paths.public.auth.signIn; // "/auth/sign-in"
const signUpPath = paths.public.auth.signUp; // "/auth/sign-up"
const socialCallbackPath = paths.public.auth.socialCallback; // "/auth/callback"
const forgotPasswordPath = paths.private.auth.forgot_password; // "/auth/forgot-password"

const authTree: RouteNode = {
  path: "auth",
  element: <AuthLayout />,
  handle: {
    crumb: { label: "Authentication" },
  },
  children: [
    {
      index: true,
      element: <SignInPage />,
      handle: { crumb: { label: "Sign in", backTo: paths.public.home } },
      meta: {
        title: withAppName("Sign in"),
        description: "Sign in to your Campus & Clubs account.",
      },
    },
    {
      path: strip(signInPath, "/auth/"),
      element: <SignInPage />,
      handle: { crumb: { label: "Sign in", backTo: paths.public.home } },
      meta: {
        title: withAppName("Sign in"),
        description: "Sign in to your Campus & Clubs account.",
      },
    },
    {
      path: strip(signUpPath, "/auth/"),
      element: <SignUpPage />,
      handle: { crumb: { label: "Create account", backTo: signInPath } },
      meta: {
        title: withAppName("Create account"),
        description: "Join Campus & Clubs — connect with your campus.",
      },
    },
    {
      path: strip(socialCallbackPath, "/auth/"),
      element: <SocialAuthCallback />,
      meta: { title: withAppName("Signing you in…") },
    },
    {
      path: strip(forgotPasswordPath, "/auth/"),
      element: <ForgotPasswordPage />,
      handle: { crumb: { label: "Forgot password", backTo: signInPath } },
      meta: {
        title: withAppName("Forgot password"),
        description: "Recover your Campus & Clubs account.",
      },
    },
    {
      path: "account/reset-password/:key",
      element: <ResetPasswordPage />,
      handle: { crumb: { label: "Reset password", backTo: forgotPasswordPath } },
      meta: { title: withAppName("Reset password") },
    },
    {
      path: "account/verify-email/:key",
      element: <VerifyEmailByKeyPage />,
      handle: { crumb: { label: "Verify email" } },
      meta: { title: withAppName("Verify email") },
    },
    {
      path: "account/email/verify/",
      element: <VerifyEmailOtpPage />,
      handle: { crumb: { label: "Verify email (code)" } },
      meta: { title: withAppName("Verify email") },
    },
  ],
};

// ---------------------------------------------------------------------------
// Activation — public, at /activate/:uuid/:token, no layout
// ---------------------------------------------------------------------------

const activationRoute: RouteNode = {
  path: strip(paths.private.auth.activation, "/"),
  element: <ActivationPage />,
  meta: { title: withAppName("Activate account") },
};

// ---------------------------------------------------------------------------
// App shell — MainLayout wraps the authenticated app (everything else)
// ---------------------------------------------------------------------------

const appShell: RouteNode = {
  path: "/",
  element: <MainLayout />,
  meta: { title: withAppName("Campus & Clubs") },
  children: [
    // TODO: migrate the rest of the old flat routes here.
    // For now, anything that isn't an auth route falls through here and
    // gets caught by the 404 splat.
    {
      path: "*",
      element: <NotFound />,
      meta: { title: withAppName("Page not found") },
    },
  ],
};

// ---------------------------------------------------------------------------
// Root tree (top-level route array)
// ---------------------------------------------------------------------------

export const appRoutes: RouteNode[] = [authTree, activationRoute, appShell];

/** Utility to flatten the compiled tree (useful for tests/nav generation). */
export function flattenRoutes(routes: RouteObject[]): RouteObject[] {
  const out: RouteObject[] = [];
  const walk = (list: RouteObject[]) => {
    for (const r of list) {
      out.push(r);
      if (r.children) walk(r.children);
    }
  };
  walk(routes);
  return out;
}
