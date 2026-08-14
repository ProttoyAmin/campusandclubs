import React from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Card } from "design/components/ui/card";
import ProfileLayoutHeader from "@/features/user/components/layout/layout-header";
import { useUser } from "@/features/user/hooks/user.hooks";
import type { UserResponse } from "@/features/user/api/user.client";
import { useSession } from "@/features/auth/hooks";

export type UserProfileLayoutProps = {
  user: UserResponse;
  currentUser: UserResponse;
};

export const UserProfileLayout: React.FC = () => {
  const { username } = useParams();
  const { data: user } = useUser(username as string);
  const { data: currentUser } = useSession();
  const navigate = useNavigate();
  const pageHeader = usePageHeader();

  React.useEffect(() => {
    document.title = `@${username}`;
  }, [username]);

  React.useEffect(() => {
    pageHeader.setActions(
      <>
        <ProfileLayoutHeader user={user} currentUser={currentUser} />
      </>,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [
    username,
    user,
    navigate,
    pageHeader.setActions,
    pageHeader.clearActions,
  ]);

  return (
    <section className="flex flex-col gap-4 max-w-3xl justify-around overflow-x-hidden">
      <div className="flex justify-between items-center p-2">
        {pageHeader.actions}
      </div>
      <Card className="w-full bg-background overflow-y-auto max-h-[calc(100vh-5rem)]">
        <Outlet context={{ user, currentUser }} />
      </Card>
    </section>
  );
};
