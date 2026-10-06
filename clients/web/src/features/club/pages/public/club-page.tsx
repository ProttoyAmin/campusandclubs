import React from "react";
import { CardContent, CardHeader } from "design/components/ui/card";
import { useClubOutlet } from "../../context/club-layout-context";
import { Outlet, useParams } from "react-router-dom";
import NavTabs from "@/components/nav-tabs";
import { clubProfileMenu } from "@/config/menu/club/club-menu";
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileEmpty02Icon, LockKeyholeIcon } from "@hugeicons/core-free-icons";

const ClubPage: React.FC = () => {
  const { club } = useClubOutlet();
  const { slug } = useParams();

  if (!club) {
    return (
      <EmptyState
        title="Not found"
        description="The club you are looking for does not exist or has been removed."
        icon={<HugeiconsIcon icon={FileEmpty02Icon} />}
      />
    );
  }

  if (club.privacy === "private" && !club.is_member) {
    return (
      <EmptyState
        title=""
        description="This club is private. You need to be a member to view its content."
        icon={
          <HugeiconsIcon
            icon={LockKeyholeIcon}
            className="size-10 text-muted-foreground"
          />
        }
      />
    );
  }

  return (
    <>
      <CardHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur p-0 border-b">
        <NavTabs
          menu={clubProfileMenu(slug)}
          className="flex items-center justify-around text-center w-full"
          itemsClassName="justify-center flex-1"
          variant="tab"
        />
      </CardHeader>
      <CardContent className="p-3 md:p-5">
        <Outlet context={{ club }} />
      </CardContent>
    </>
  );
};

export default ClubPage;
