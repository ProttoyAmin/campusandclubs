import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { CardContent } from "design/components/ui/card";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";

const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club } = useClub(slug);
  return (
    <CardContent className="flex w-full gap-4">
      <div className="relative w-2/6 border-r pr-4">
        <SideBar menu={clubConfigureMenu} menuParam={slug} className="sticky top-0 left-0"/>
      </div>
      <div className="w-3/5 overflow-hidden">
        <Outlet context={{ club }} />
      </div>
    </CardContent>
  );
};

export default ClubConfigLayout;
