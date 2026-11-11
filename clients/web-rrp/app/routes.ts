import { index, layout, prefix, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * Route manifest.
 *
 * Structure:
 *   - "/" (and splats under it) render inside the authenticated `_app` shell.
 *   - "/auth/*" renders inside the public auth layout.
 *   - "/activate/:uuid/:token" is a standalone public route with no layout.
 */
export default [
  // ---- Authenticated app shell (pathless layout, wraps "/*" except auth) ----
  layout("routes/_app/layout.tsx", [
    index("routes/_app/_index.tsx"),
    route("*", "routes/_app.$.tsx"),
  ]),

  // ---- Auth subtree (public, outside _app) ----
  route("auth", "routes/auth/layout.tsx", [
    index("routes/auth/_index.tsx"),
    route("sign-in", "routes/auth/sign-in/route.tsx"),
    route("sign-up", "routes/auth/sign-up/route.tsx"),
    route("callback", "routes/auth/callback/route.tsx"),
    route("forgot-password", "routes/auth/forgot-password/route.tsx"),
    ...prefix("account", [
      route("reset-password/:key", "routes/auth/account/reset-password.$key/route.tsx"),
      route("verify-email/:key", "routes/auth/account/verify-email.$key/route.tsx"),
      route("email/verify", "routes/auth/account/email/verify/route.tsx"),
    ]),
  ]),

  // ---- Public activation route ----
  route("activate/:uuid/:token", "routes/activate.$uuid.$token/route.tsx"),
] satisfies RouteConfig;
