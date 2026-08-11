import React from "react";
import { useSession } from "@/features/auth/hooks";
import { paths } from "@/settings/routes";
import { useNavigate } from "react-router-dom";

const AuthorizeRequest = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const { data: isAuthenticated } = useSession();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (isAuthenticated) return;
    navigate(paths.public.auth.signIn, { replace: true });
  }, [isAuthenticated, navigate]);
  return <>{children}</>;
};

export default AuthorizeRequest;
