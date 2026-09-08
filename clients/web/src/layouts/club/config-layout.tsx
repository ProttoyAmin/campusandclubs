import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { CardContent } from "design/components/ui/card";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import EmptyState from "@/shared/components/empty-state";

const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club, isPending } = useClub(slug);

  if (isPending) {
    return null;
  }

  if (!club?.is_owner) {
    return (
      <>
        <EmptyState
          title="Not found"
          description="the page you are looking for doesn't exist"
        />
      </>
    );
  }

  return (
    <section className="flex flex-col gap-4 max-w-3xl justify-around">
      <CardContent className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-2/6 pr-4 md:border-r">
          <SideBar menu={clubConfigureMenu} menuParam={slug} className="sticky top-0 left-0" />
        </div>
        <div className="w-full overflow-hidden">
          <Outlet context={{ club }} />
        </div>
      </CardContent>
    </section>
  );
};

export default ClubConfigLayout;
