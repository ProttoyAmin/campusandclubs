import { ClubJoinDialog } from "@/features/club/components/club/club-join-dialog";
import { useClub, useJoin } from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Button } from "design/components/ui/button";
import { ArrowLeftIcon, MoreHorizontalIcon, Search } from "lucide-react";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Spinner } from "design/components/ui/spinner";

export const ClubMainLayout: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pageHeader = usePageHeader();
  const { data: club } = useClub(slug);
  const {
    mutate: joinClub,
    error: joinError,
    isPending: isJoinPending,
  } = useJoin(club?.id, slug);
  const [joinDialogData, setJoinDialogData] = React.useState<{
    detail: string;
    application_url: string;
  } | null>(null);

  const handleJoin = () => {
    if (club?.is_member) return;
    if (club?.application_status === "pending") return;
    joinClub(null, {
      onSuccess: () => {
        console.log("Joined successfully");
      },

      onError: () => {
        setJoinDialogData(joinError ?? null);
      },
    });
  };

  React.useEffect(() => {
    document.title = `${slug} - Club`;
  }, [slug]);

  React.useEffect(() => {
    pageHeader.setActions(
      <>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            className={`rounded-full ${location.pathname === document.location.pathname ? "invisible" : ""}`}
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <p className="text-lg">{club?.name}</p>
            <p className="text-sm text-muted-foreground">
              {club?.member_count} members
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={club?.is_member ? "ghost" : "outline"}
            disabled={isJoinPending || club?.is_member || club?.application_status !== null}
            onClick={() => handleJoin()}
          >
            {isJoinPending && (
              <Spinner className="mr-2" data-icon="inline-start" />
            )}

            {isJoinPending ? "Joining..." : club?.is_member ? "Joined" : club?.application_status === "pending" ? "Pending" : "Join"}
          </Button>
          <Button variant={"ghost"} className={"rounded-full"} size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant={"ghost"} className={"rounded-full"} size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
          <ClubJoinDialog
            open={!!joinDialogData}
            onOpenChange={(open) => !open && setJoinDialogData(null)}
            title={`${club?.name}`}
            description={`is taking submissions to join. Submit an application to apply for a membership.`}
            clubId={club?.id}
          />
        </div>
      </>,
    );

    return () => {
      pageHeader.clearActions();
    };
  }, [
    slug,
    isJoinPending,
    joinDialogData,
    navigate,
    pageHeader.setActions,
    pageHeader.clearActions,
    club,
  ]);

  return (
    <section className="flex flex-col gap-8 w-2xl">
      <div className="flex justify-between items-center">
        {pageHeader.actions}
      </div>
      <div className="">
        <Outlet context={{ club }} />
      </div>
    </section>
  );
};

export default ClubMainLayout;
