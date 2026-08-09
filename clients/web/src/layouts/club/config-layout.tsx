import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "design/components/ui/card";
import { useClubOutlet } from "@/features/club/context/club-layout-context";
import { useClub } from "@/features/club/hooks/club.hooks";

const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club } = useClub(slug);
  return (
    <div className="flex gap-4 w-full">
      <SideBar for="club" />
      <Card className="w-full bg-background overflow-y-auto max-h-[calc(100vh-64px)]">
        <CardContent>
          <Outlet context={{ club }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubConfigLayout;
