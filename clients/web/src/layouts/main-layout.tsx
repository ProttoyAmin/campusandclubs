import React, { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
// import { ProtectedRoute } from '@/guards';
import SideBar from "@/components/sidebar";
import PageHeaderProvider from "@/providers/page-header-provider";
import Create from "@/components/create";
import Guard from "@/guards/guard";
import { Toaster } from "design/components/ui/toast";
import BottomBar from "@/components/bottom-bar";

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
    <Suspense fallback={<div>this is loading...</div>}>
      <Guard>
        <PageHeaderProvider>
          <div className="flex relative h-screen">
            <div className="w-full md:w-1/6 md:container hidden md:block overflow-y-auto">
              <SideBar main />
            </div>
            <div className="w-full md:w-5/6 md:ps-40 pt-2 overflow-y-auto">
              <Outlet />
            </div>
            <div className="absolute bottom-6 right-20">
              <Create />
            </div>
            <div className="absolute bottom-0 w-full z-50 h-12 md:hidden ">
              <BottomBar className="flex h-full" />
            </div>
          </div>
          <Toaster />
        </PageHeaderProvider>
      </Guard>
    </Suspense>
  );
};

export default MainLayout;
