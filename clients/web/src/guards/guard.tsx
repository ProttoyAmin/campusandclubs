import React, { useEffect, useState } from "react";
import { matchPath, Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/session.hook";
import { paths, routes } from "@/settings/routes";

const PUBLIC_PATTERNS = [
  routes.auth.public.sign_in,
  routes.auth.public.sign_up,
  routes.auth.private.forgot_password,
  routes.auth.private.activation,
  routes.auth.private.reset_password,
  routes.auth.private.verify_email,
];

const AUTH_PATTERNS = [
  routes.auth.public.sign_in,
  routes.auth.public.sign_up,
  routes.auth.private.forgot_password,
  routes.auth.public.social_callback,
  routes.auth.private.activation,
  routes.auth.private.reset_password,
];

const matchesAny = (patterns: string[], pathname: string) =>
  patterns.some((pattern) => matchPath(pattern, pathname));

const Guard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isLoading } = useSession();
  const location = useLocation();

  // On the server we skip all auth logic and just render children.
  // We must do the SAME thing on the client's first render (before
  // hydration finishes), or React will flag a hydration mismatch.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{children}</>;
  }

  const isPublicRoute = matchesAny(PUBLIC_PATTERNS, location.pathname);
  const isAuthRoute = matchesAny(AUTH_PATTERNS, location.pathname);

  if (isLoading) {
    return null;
  }

  if (!session && !isPublicRoute) {
    return (
      <Navigate
        to={paths.public.auth.signIn}
        state={{ from: location }}
        replace
      />
    );
  }

  if (session && isAuthRoute) {
    return <Navigate to={"/"} replace />;
  }

  return <>{children}</>;
};

export default Guard;