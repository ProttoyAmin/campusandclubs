import { ClubApplicationDialog } from "@/features/club/components/club/club-apply-dialog";
import {
  useClub,
  useDepartmentTemplates,
  useGetClubs,
  useJoin,
} from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ClubApplicationWithdrawDialog } from "@/features/club/components/club/club-withdraw-dialog";
import ClubLayoutHeader from "@/features/club/components/layout/layout-header";
import { Card } from "design/components/ui/card";
import { toast } from "design/components/ui/toast";
import { generateId } from "@/utils/id";
import { useSectionId } from "@/shared/hooks/id";
import ClubsLayoutHeader from "@/features/club/components/layout/clubs-layout-header";
import { useLocation } from "react-router-dom";
import { useInstitutes } from "@/features/institute/hooks/institute.hooks";

export const ClubsLayout: React.FC = () => {
  const { data } = useGetClubs();
  const clubs = data?.results;
  const pageHeader = usePageHeader();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = `Clubs`;
  }, []);

  const handleCreateClub = () => {
    toast.add({
      title: "Club created",
      description: "Club created successfully",
    });
  };

  React.useEffect(() => {
    pageHeader.setActions(
      <ClubsLayoutHeader clubs={clubs} onCreateClub={handleCreateClub} />,
    );
  }, [data, clubs, navigate, pageHeader.setActions, pageHeader.clearActions]);

  return (
    <section
      id={useSectionId()}
      className="flex flex-col gap-4 max-w-3xl justify-around"
    >
      <Card className="w-full bg-background overflow-y-auto md:max-h-[calc(100vh-5rem)]">
        <Outlet context={{ clubs: clubs }} />
      </Card>
    </section>
  );
};

export default ClubsLayout;
