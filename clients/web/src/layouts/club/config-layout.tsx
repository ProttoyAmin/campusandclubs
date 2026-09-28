import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "design/components/ui/card";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import EmptyState from "@/shared/components/empty-state";
import { usePageHeader } from "@/shared/hooks/use-page-header";

const ClubConfigLayout = () => {
  const { slug } = useParams();
  const { data: club, isPending } = useClub(slug);
  const pageHeader = usePageHeader();

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
    // <section className="flex flex-col gap-4 w-full justify-around pt-6">
    //   <CardContent className="flex flex-col lg:flex-row gap-4 md:h-[calc(100vh-150px)] min-w-screen xl:min-w-6xl">
    //     <div className="relative min-w-fit max-w-1/5 xl:w-2/7 pr-4 lg:border-r">
    //       <SideBar menu={clubConfigureMenu} menuParam={slug} className="sticky top-0 left-0" />
    //     </div>
    //     <div className="w-full relative">
    //       <Outlet context={{ club }} />
    //     </div>
    //   </CardContent>
    // </section>
    <>
      <section className="flex flex-row gap-4 w-5xl justify-around mx-auto p-4">
        {/* <div className="flex justify-between"> */}
        <div className="relative min-w-fit max-w-1/5 xl:w-2/7 pr-4 lg:border-r">
          <SideBar menu={clubConfigureMenu} menuParam={slug} className="sticky top-4 left-0 " />
        </div>
        {/* </div> */}
        <main className="w-full bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none p-0">
          <Outlet context={{ club }} />
        </main>
      </section>
    </>
  );
};

export default ClubConfigLayout;
