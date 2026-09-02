import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "@/components/sidebar";
import PageHeaderProvider from "@/providers/page-header-provider";
import Create from "@/components/create";
import Guard from "@/guards/guard";
import { Toaster } from "design/components/ui/toast";
import BottomBar from "@/components/bottom-bar";
import AppDialog from "@/shared/components/app-dialog";
import { Button } from "design/components/ui/button";
import { PlusIcon } from "lucide-react";

const MainLayout: React.FC = () => {
  return (
    <Suspense fallback={<div>this is loading...</div>}>
      <Guard>
        <PageHeaderProvider>
          <div className="flex relative h-screen">
            <div className="w-full md:w-1/6 md:container hidden md:block overflow-y-auto">
              <SideBar main />
            </div>
            <div className="w-full md:w-5/6 md:ps-40 pt-2">
              <Outlet />
            </div>
            <div className="absolute bottom-6 right-20">
              {/* <AppDialog
                trigger={<Button variant={"outline"} size={"icon-lg"} className={"shadow-2xl"}>
                  <PlusIcon className="size-5" />
                </Button>}
                title="Create post"
              > */}
              <Create />
              {/* </AppDialog> */}
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
