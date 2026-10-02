import React, { useRef } from "react";
import { useParams, Outlet, useLocation } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card } from "design/components/ui/card";
import ProfileLayoutHeader, { ProfileLayoutHeaderSkeleton } from "@/features/user/components/layout/layout-header";
import { useUser } from "@/features/user/hooks/user.hooks";
import type { UserResponse } from "@/features/user/api/user.client";
import { useSession } from "@/features/auth/hooks";
import type { AuthSession } from "@/features/auth/services/authentication";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";
import { Skeleton } from "design/components/ui/skeleton";
import Create from "@/components/create";

export type UserProfileLayoutProps = {
  user: UserResponse;
  currentUser: AuthSession;
  isLoading?: boolean;
};

export function SkeletonProfileDemo() {
  return (
    <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </section>
  )
}


export const UserProfileLayout: React.FC = () => {
  const { username } = useParams();
  const { user } = useUser(username as string);
  const { data: currentUser } = useSession();
  const pageHeader = usePageHeader();
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useScrollRestoration(scrollRef, location.key);

  React.useEffect(() => {
    if (user.data) {
      document.title = `${user.data.first_name ? user.data.first_name : ""} ${user.data.last_name ? user.data.last_name : ""} (@${username})`;
    } else {
      document.title = `@${username}`;
    }
  }, [username, user.data]);

  return (
    <section className="flex flex-col gap-4 max-w-3xl justify-around mx-auto">
      <div className="flex justify-between items-center">
        {pageHeader.actions ?? <ProfileLayoutHeader user={user.data} currentUser={currentUser} isLoading={user.isLoading} />}
      </div>
      <Card ref={scrollRef} className="w-full border-none rounded-none md:border md:rounded-xl bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] scrollbar-none p-0 shadow-2xl shadow-muted">
        <Outlet context={{ user: user.data, currentUser, isLoading: user.isLoading }} />
      </Card>
      <div className="absolute bottom-14 right-5 md:right-20">
        <Create />
      </div>
    </section>
  );
};
