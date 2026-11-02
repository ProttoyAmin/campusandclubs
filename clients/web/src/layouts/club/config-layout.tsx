import { Outlet, useParams } from "react-router-dom";
import SideBar from "@/components/sidebar";
import { useClub } from "@/features/club/hooks/club.hooks";
import { clubConfigureMenu } from "@/config/menu/club-configure-menu";
import EmptyState from "@/shared/components/empty-state";
import { useIsMobile } from "design/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { paths } from "@/settings/routes";
import { isRouteActive } from "@/utils/route";
import React from "react";
import Menu from "@/shared/components/menu";


const ClubConfigLayout = () => {
  const isMobile = useIsMobile();
  const { slug } = useParams();
  const location = useLocation();
  const { data: club, isPending } = useClub(slug);
  const basePath = paths.private.club.config(slug);
  const isRootPath = isRouteActive(basePath, location.pathname);

  if (isPending) {
    return null;
  }

  if (!club?.is_owner && club?.me_permissions?.length === 0) {
    return (
      <EmptyState
        title="Not found"
        description="the page you are looking for doesn't exist"
      />
    );
  }

  if (isMobile) {
    return (
      <section className={`flex flex-col md:flex-row gap-4 justify-around mx-auto p-4`}>
        {isRootPath ? (
          <div className='rounded-md border divide-y divide-border'>
            <Menu items={clubConfigureMenu(slug)} />
          </div>
        ) : (
          <main className="w-full bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none p-0">
            <Outlet context={{ club }} />
          </main>
        )}
      </section>
    )
  }

  return (
    <>
      {isRootPath ? (
        <React.Suspense fallback={<div className="size-8 rounded-full bg-muted animate-pulse"></div>}>
          <section className={`flex justify-center items-center h-full mx-auto p-4`}>
            <div className='rounded-md border divide-y divide-border w-full max-w-4xl h-fit cursor-pointer'>
              <Menu items={clubConfigureMenu(slug)} />
            </div>
          </section>
        </React.Suspense>
      ) : (
        <section className={`flex flex-col md:flex-row gap-4 justify-around mx-auto p-4`}>
          <div className={`relative min-w-fit max-w-1/5 xl:w-2/7 pr-4 lg:border-r`}>
            <SideBar menu={clubConfigureMenu} menuParam={slug} className={`sticky top-4 left-0`} />
          </div>
          <main className="w-full bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-8rem)] scrollbar-none p-0">
            <Outlet context={{ club }} />
          </main>
        </section>
      )}
    </>
  );
};

export default ClubConfigLayout;
