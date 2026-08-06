import React from "react";
import { useSession } from "@/features/auth/hooks";

const AuthorizeRequest = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const { data: isAuthenticated } = useSession();
  React.useEffect(() => {
    if (isAuthenticated) return;
  }, [isAuthenticated]);
  return <>{children}</>;
};

export default AuthorizeRequest;
