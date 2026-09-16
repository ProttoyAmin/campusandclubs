import {
  useGetClubs,
} from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import { Outlet } from "react-router-dom";
import { Card } from "design/components/ui/card";
import { toast } from "design/components/ui/toast";
import { useSectionId } from "@/shared/hooks/id";
import ClubsLayoutHeader from "@/features/club/components/layout/clubs-layout-header";

export const ClubsLayout: React.FC = () => {
  const { data } = useGetClubs();
  const clubs = data?.results;
  const pageHeader = usePageHeader();

  React.useEffect(() => {
    document.title = `Clubs`;
  }, []);

  const handleCreateClub = () => {
    toast.add({
      title: "Club created",
      description: "Club created successfully",
    });
  };

  return (
    <section
      id={useSectionId()}
      className="flex flex-col gap-4 max-w-3xl justify-around"
    >
      <div className="flex justify-between items-center p-2">
        {pageHeader.actions ?? <ClubsLayoutHeader clubs={clubs} onCreateClub={handleCreateClub} />}
      </div>
      <Card className="w-full bg-background overflow-y-auto md:max-h-[calc(100vh-5rem)]">
        <Outlet context={{ clubs: clubs }} />
      </Card>
    </section>
  );
};

export default ClubsLayout;
