import React from "react";
import { useClubOutlet } from "../../context/club-layout-context";
import { Outlet, useParams } from "react-router-dom";
import EmptyState from "@/shared/components/empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileEmpty02Icon, LockKeyholeIcon } from "@hugeicons/core-free-icons";
import defaultBanner from "@/assets/4578-dragon-ball-z.png";
import BottomBar from "@/components/bottom-bar";

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
    <div className="w-full relative max-w-3xl mx-auto">
      <div className="bg-background/90 backdrop-blur p-0">

        <div className="relative h-48 md:h-64">
          {club?.banner ? (
            <img src={club.banner} alt={club?.name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultBanner} alt={`${club?.name} banner`} className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
        </div>
        {/* <NavTabs
          menu={clubProfileMenu(slug)}
          className="flex justify-start w-full"
          itemsClassName="justify-center flex-1"
          variant="tab"
        /> */}
      </div>
      <div className="p-0">
        <Outlet context={{ club }} />
      </div>
      <div className="md:hidden fixed bottom-0 w-full z-50 h-10 bg-background">
        <BottomBar />
      </div>
    </div>
  );
};

export default ClubPage;