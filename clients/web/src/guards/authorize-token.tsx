import React from "react";
import { useSession } from "@/features/auth/hooks";
import { paths } from "@/settings/routes";
import { Navigate } from "react-router-dom";

const AuthorizeRequest = ({ children }: { children: React.ReactElement }) => {
  const { data, isPending, isError } = useSession();

  const isAuthenticated = data?.meta?.is_authenticated === true;

  if (isPending) {
    return null;
  }

  if (isError || !isAuthenticated) {
    return <Navigate to={paths.public.auth.signIn} replace />;
  }

  return <>{children}</>;
};

export default AuthorizeRequest;
