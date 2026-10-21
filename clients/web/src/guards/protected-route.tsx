import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/";
import { paths } from "@/settings/routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: isAuthenticated, isLoading } = useSession();
  const location = useLocation();

//   if (isLoading) return <div>Loading...</div>;
  console.log("isAuthenticated", isAuthenticated)

//   if (!isAuthenticated) {
//     return <Navigate to={paths.public.auth.signIn} state={{ from: location }} replace />;
//   }

  return <>{children}</>;
};