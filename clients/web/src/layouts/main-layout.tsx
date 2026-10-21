import React, { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Guard from "@/guards/guard";
import { Toaster } from "design/components/ui/toast";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";
import { SocketProvider } from "@/providers/socket-provider";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { useSocketEvent } from "@/shared/hooks/use-socket-event";
import { toast } from "design/components/ui/toast";
import { queryClient } from "@/config/query-client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "design/components/ui/avatar"
import { SidebarProvider } from "design/components/ui/sidebar";

const MainLayout: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useScrollRestoration(scrollRef, location.key);

  useSocketEvent("notification:created", (data: any) => {
    queryClient.invalidateQueries({
      queryKey: ["notifications"]
    })
    toast.add({
      title: <div className="flex flex-row gap-4">
        <Avatar className={'flex items-center justify-center'}>
          <AvatarImage src={data?.actor?.avatar} />
          <AvatarFallback>{data?.actor?.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{data.actor.username}</p>
          <p className="text-xs text-muted-foreground">{data?.content}</p>
        </div>
      </div>,
      timeout: 5000,
    })
  })

  useSocketEvent("chat:start", () => {
    queryClient.invalidateQueries({
      queryKey: ["chats"],
    });
  });

  return (
    <Guard>
      <SidebarProvider defaultOpen={false}>
        <SocketProvider>
          <div
            className="
              grid min-h-screen w-full
              grid-cols-1
              md:grid-cols-[auto_minmax(0,1fr)_auto]
              lg:grid-cols-[1fr_content-fit_auto]
            "
          >
            <div className="hidden md:block">
              <AppSidebar />
            </div>
            <main ref={scrollRef} className="grid-2 w-full">
              <Outlet />
            </main>
            <aside className="grid-3 hidden md:block justify-self-start">

            </aside>
          </div>
          <Toaster />
        </SocketProvider>
      </SidebarProvider>
    </Guard>
  );
};

export default MainLayout;
