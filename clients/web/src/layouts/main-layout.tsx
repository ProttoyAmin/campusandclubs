import React, { Suspense, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "@/components/sidebar";
import PageHeaderProvider from "@/providers/page-header-provider";
import Create from "@/components/create";
import Guard from "@/guards/guard";
import { Toaster } from "design/components/ui/toast";
import BottomBar from "@/components/bottom-bar";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";

const MainLayout: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useScrollRestoration(scrollRef, location.key);
  return (
    <Guard>
      <PageHeaderProvider>
        <div className="flex relative h-screen">
          <div className="w-full md:w-1/7 md:container hidden md:block overflow-y-auto">
            <SideBar main />
          </div>
          <div ref={scrollRef} className="w-full md:w-6/7 pt-2 overflow-y-auto scrollbar-none">
            <Suspense fallback={<div>this is loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
          <div className="absolute bottom-14 right-5 md:right-20">
            <Create />
          </div>
          <div className="absolute bottom-0 w-full z-50 h-12 md:hidden">
            <BottomBar className="flex h-full" />
          </div>
        </div>
        <Toaster />
      </PageHeaderProvider>
    </Guard>
  );
};

export default MainLayout;
