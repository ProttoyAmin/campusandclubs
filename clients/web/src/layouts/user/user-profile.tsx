import React, { useRef } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card } from "design/components/ui/card";
import ProfileLayoutHeader from "@/features/user/components/layout/layout-header";
import { useUser } from "@/features/user/hooks/user.hooks";
import type { UserResponse } from "@/features/user/api/user.client";
import { useSession } from "@/features/auth/hooks";
import type { AuthSession } from "@/features/auth/services/authentication";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";

export type UserProfileLayoutProps = {
  user: UserResponse;
  currentUser: AuthSession;
};

export const UserProfileLayout: React.FC = () => {
  const { username } = useParams();
  const { user } = useUser(username as string);
  const { data: currentUser } = useSession();
  const navigate = useNavigate();
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

  React.useEffect(() => {
    pageHeader.setActions(
      <>
        <ProfileLayoutHeader user={user.data} currentUser={currentUser} />
      </>,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [
    username,
    user.data,
    currentUser,
    navigate,
    pageHeader.setActions,
    pageHeader.clearActions,
  ]);

  return (
    <section className="flex flex-col gap-4 max-w-3xl justify-around">
      <div className="flex justify-between items-center p-2">
        {pageHeader.actions}
      </div>
      <Card ref={scrollRef} className="w-full bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none pb-0 pt-0">
        <Outlet context={{ user: user.data, currentUser }} />
      </Card>
    </section>
  );
};
