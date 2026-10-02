import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import EmptyState from "@/shared/components/empty-state";
import NavTabs from "@/components/nav-tabs";
import { useIsMobile } from "design/hooks/use-mobile";

const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club, isPending } = useClub(slug);
  const isMobile = useIsMobile();
  console.log("RENDDEREDD!!", isMobile);

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
    <>
      <section className={`flex flex-row gap-4 w-5xl justify-around mx-auto p-4 ${isMobile ? "flex-col" : ""}`}>
        <div className="relative min-w-fit max-w-1/5 xl:w-2/7 pr-4 lg:border-r">
          <SideBar menu={clubConfigureMenu} menuParam={slug} className="sticky top-4 left-0" />
        </div>
        <main className="w-full bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none p-0">
          <Outlet context={{ club }} />
        </main>
      </section>
    </>
  );
};

export default ClubConfigLayout;
