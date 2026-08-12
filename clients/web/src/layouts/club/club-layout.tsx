import { ClubApplicationDialog } from "@/features/club/components/club/club-apply-dialog";
import { useClub, useJoin } from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ClubApplicationWithdrawDialog } from "@/features/club/components/club/club-withdraw-dialog";
import ClubLayoutHeader from "@/features/club/components/layout/layout-header";
import { Card } from "design/components/ui/card";
import EmptyState from "@/shared/components/empty-state";
import { Spinner } from "design/components/ui/spinner";
import { Button } from "design/components/ui/button";
import { toast } from "design/components/ui/toast";

export const ClubMainLayout: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const pageHeader = usePageHeader();
  const {
    data: club,
    error: clubError,
    isLoading: clubIsLoading,
  } = useClub(slug);
  const { mutate: joinClub, isPending: isJoinPending } = useJoin(
    club?.id,
    slug,
  );
  const [joinDialogData, setJoinDialogData] = React.useState<{
    detail: string;
    application_url: string;
  } | null>(null);
  const [isWithdrawing, setIsWithdrawing] = React.useState(false);

  const handleJoin = () => {
    if (club?.is_member) return;
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
      },

      onError: (error) => {
        setJoinDialogData(
          (error as { detail: string; application_url: string }) ?? null,
        );
      },
    });
  };

  React.useEffect(() => {
    document.title = `${slug} - Club`;
  }, [slug]);

  React.useEffect(() => {
    pageHeader.setActions(
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
          applicationId={club?.application?.id}
        />
      </>,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [
    slug,
    club,
    isJoinPending,
    joinDialogData,
    isWithdrawing,
    navigate,
    pageHeader.setActions,
    pageHeader.clearActions,
  ]);

  const handleError = React.useCallback(() => {
    if (clubIsLoading) return <Spinner className="mx-auto" />;
    if (clubError?.response?.status === 404) {
      return (
        <EmptyState
          title="Club not found"
          description="The club you're looking for doesn't exist or been removed."
          children={
            <Button onClick={() => navigate(-1)} variant="outline">
              Go Back
            </Button>
          }
        />
      );
    }
  }, [clubError, clubIsLoading]);
  console.log("reached here");

  return (
    <section className="flex flex-col gap-8 max-w-3xl justify-around">
      <div className="flex justify-between items-center p-4">
        {pageHeader.actions}
      </div>
      <Card className="w-full bg-background overflow-y-auto md:max-h-[calc(100vh-5rem)]">
        {/* {handleError()} */}
        <Outlet context={{ club, clubError }} />
      </Card>
    </section>
  );
};

export default ClubMainLayout;
