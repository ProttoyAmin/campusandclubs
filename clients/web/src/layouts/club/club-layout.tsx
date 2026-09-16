import { ClubApplicationDialog } from "@/features/club/components/club/club-apply-dialog";
import { useClub, useJoin } from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React, { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ClubApplicationWithdrawDialog } from "@/features/club/components/club/club-withdraw-dialog";
import ClubLayoutHeader from "@/features/club/components/layout/layout-header";
import { Card } from "design/components/ui/card";
import { toast } from "design/components/ui/toast";
import { useSectionId } from "@/shared/hooks/id";
import { useScrollRestoration } from "@/shared/hooks/use-scroll-restoration";

export const ClubMainLayout: React.FC = () => {
  const { slug } = useParams();
  const pageHeader = usePageHeader();
  const { data: club } = useClub(slug);
  const { mutate: joinClub, isPending: isJoinPending } = useJoin(
    club?.id,
    slug,
  );
  const [joinDialogData, setJoinDialogData] = React.useState<{
    detail: string;
    application_url: string;
  } | null>(null);
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useScrollRestoration(scrollRef, location.key);

  const handleJoin = () => {
    if (club?.is_member) return;
    // @ts-ignore
    // TODO: Fix the type later (priority:low)
    if (club?.application && club?.application?.status === "pending") {
      setIsWithdrawing(true);
      return;
    }

    if (club?.join_mode === "application") {
      setJoinDialogData({
        detail: "Join this club",
        application_url: "https://example.com/application",
      });
      return;
    }
    if (club?.join_mode === "invite_only") {
      toast.add({
        title: "Club invite only",
        description: "You need to be invited to join this club",
        type: "info",
      });
      return;
    }
    joinClub(null, {
      onSuccess: () => {
        console.log("Joined successfully");
        toast.add({
          description: "Joined",
          type: "success",
        });
      },

      onError: (error) => {
        toast.add({
          description: error.response?.data.detail,
          type: "error",
        });
        console.log(error.response?.data.detail)
      },
    });
  };

  React.useEffect(() => {
    document.title = `${slug ? slug + '- Clubs' : 'Clubs'}`;
  }, [slug]);

  return (
    <section
      id={useSectionId()}
      className="flex md:ms-44 flex-col gap-4 max-w-3xl justify-around"
    >
      <div className="flex justify-between items-center">
        {pageHeader.actions ?? (
          <>
            <ClubLayoutHeader
              club={club}
              slug={slug}
              handleJoin={handleJoin}
              isJoinPending={isJoinPending}
            />

            <ClubApplicationDialog
              open={!!joinDialogData}
              onOpenChange={(open) => !open && setJoinDialogData(null)}
              title={`${club?.name}`}
              description={`is taking submissions to join. Submit an application to apply for a membership.`}
              clubId={club?.id}
            />
            <ClubApplicationWithdrawDialog
              open={isWithdrawing}
              onOpenChange={setIsWithdrawing}
              title={`${club?.name}`}
              description={`Are you sure you want to withdraw your application?`}
              clubId={club?.id}
              // @ts-ignore
              // TODO: Fix the type later (priority:low)
              applicationId={club?.application?.id}
            />
          </>
        )}
      </div>
      <Card ref={scrollRef} className="w-full border-none rounded-none md:border md:rounded-xl shadow-lg bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none p-0">
        {/* <pre>{JSON.stringify(club, null, 2)}</pre> */}
        <Outlet context={{ club }} />
      </Card>
    </section>
  );
};

export default ClubMainLayout;
