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
      <EmptyState
        title=""
        description="This club is private. You need to be a member to view its content."
        icon={<HugeiconsIcon icon={LockKeyholeIcon} className="size-10 text-muted-foreground" />}
      />
    )
  }

  return (
    <>
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
      <CardHeader className="p-0">

        <div className="">
          <NavTabs menu={clubProfileMenu(slug)} className="flex items-center justify-around text-center" itemsClassName="justify-center" variant="tab" />
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
