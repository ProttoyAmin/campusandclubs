import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
// import { ProtectedRoute } from '@/guards';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthorizeRequest from "@/guards/authorize-token";
import { ThemeProvider } from "@/providers/theme-provider";
import SideBar from "@/components/sidebar";

export type MainLayoutContext = {
  user: {
    name: string;
    role: string;
  };
  setUser: React.Dispatch<
    React.SetStateAction<{
      name: string;
      role: string;
    }>
  >;
};

const MainLayout: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider>
        {/* <AuthorizeRequest> */}
        <div className="flex">
          <div className="w-1/6">
            <SideBar />
          </div>
          <div className="px-20 py-4">
            <Outlet />
          </div>
        </div>
      </ThemeProvider>
      {/* </AuthorizeRequest> */}
      {/* <ProtectedRoute children={<Outlet />} /> */}
    </Suspense>
  );
};

export default MainLayout;
