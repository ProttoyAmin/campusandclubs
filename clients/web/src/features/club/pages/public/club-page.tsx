import React from "react";
import {
  CardContent,
  CardHeader,
} from "design/components/ui/card";
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
  const { slug } = useParams()

  if (!club) {
    return (
      <EmptyState
        title="Not found"
        description="The club you are looking for does not exist or has been removed."
        icon={<HugeiconsIcon icon={FileEmpty02Icon} />}
      />
    )
  }

  if (club.privacy === "private" && !club.is_member) {
    return (
      <div className="p-0 min-w-3xl">
        <EmptyState
          children={<></>}
          title=""
          description="This club is private. You need to be a member to view its content."
          icon={<HugeiconsIcon icon={LockKeyholeIcon} className="size-10 text-muted-foreground" />}
        />
      </div>
    )
  }

  return (
    <>
      <CardHeader className="p-0 min-w-3xl">

        <div className="relative h-64">
          {/* TODO: shows banner and implement avatar using club preference later */}
          {club?.banner ? (
            <img src={club.banner} alt={club?.name} className="w-full h-full object-cover" />
          ) : (
            <img src={defaultBanner} alt={`${club?.name} banner`} className="w-full h-full object-cover" />
          )}
          {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent"></div>
        </div>
        <div className="">
          <NavTabs menu={clubProfileMenu(slug)} className="flex items-center justify-center text-center max-w-40" itemsClassName="justify-center" variant="tab" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* <pre>{JSON.stringify(club, null, 2)}</pre> */}
        <Outlet context={{ club }} />
      </CardContent>
    </>
  );
};

export default ClubPage;
