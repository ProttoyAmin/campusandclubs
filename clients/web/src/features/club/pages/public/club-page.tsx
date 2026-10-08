import React from "react";
import { CardContent, CardHeader } from "design/components/ui/card";
import { useClubOutlet } from "../../context/club-layout-context";
import { Outlet, useParams } from "react-router-dom";
import NavTabs from "@/components/nav-tabs";
import { clubProfileMenu } from "@/config/menu/club/club-menu";
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileEmpty02Icon, LockKeyholeIcon } from "@hugeicons/core-free-icons";
import defaultBanner from "@/assets/4578-dragon-ball-z.png";

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
    <div className="w-full relative">
      <div className="bg-background/90 backdrop-blur p-0">

        <div className="relative h-48 md:h-64">
          {club?.banner ? (
            <img src={club.banner} alt={club?.name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultBanner} alt={`${club?.name} banner`} className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
        </div>
        <NavTabs
          menu={clubProfileMenu(slug)}
          className="flex justify-start w-full"
          itemsClassName="justify-center flex-1"
          variant="tab"
        />
      </div>
      <div className="p-0">
        <Outlet context={{ club }} />
      </div>
    </div>
  );
};

export default ClubPage;