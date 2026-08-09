import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
// import { ProtectedRoute } from '@/guards';
import SideBar from "@/components/sidebar";
import PageHeaderProvider from "@/providers/page-header-provider";
import Create from "@/components/create";
import Guard from "@/guards/guard";
import { Toaster } from "design/components/ui/toast";


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
      <Guard>
      <PageHeaderProvider>
          <div className="flex relative h-screen overflow-hidden">
            <div className="w-1/6 container">
              <SideBar main />
            </div>
            <div className="w-5/6 ps-40 container pt-2">
              <Outlet />
            </div>
            <div className="absolute bottom-6 right-20">
              <Create />
            </div>
          </div>
          <Toaster />
      </PageHeaderProvider>
      </Guard>
    </Suspense>
  );
};

export default MainLayout;
