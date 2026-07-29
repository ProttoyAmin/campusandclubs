import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/";
import { paths } from "@/settings/routes";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { data: isAuthenticated, isLoading } = useSession();

  if (isLoading) return <div>Loading...</div>;
  console.log("isAuthenticated", isAuthenticated)

//   if (isAuthenticated) {
//     return <Navigate to={paths.public.home} replace />;
//   }

  return <>{children}</>;
};