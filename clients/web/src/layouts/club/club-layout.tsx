import { ClubApplicationDialog } from "@/features/club/components/club/club-apply-dialog";
import { useClub, useJoin } from "@/features/club/hooks/club.hooks";
import { usePageHeader } from "@/shared/hooks/use-page-header";
import { Button } from "design/components/ui/button";
import { ArrowLeftIcon, Search, Cog } from "lucide-react";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Spinner } from "design/components/ui/spinner";
import { ClubApplicationWithdrawDialog } from "@/features/club/components/club/club-withdraw-dialog";
import { paths } from "@/settings/routes";

export const ClubMainLayout: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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
        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            className={`rounded-full`}
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <img
            src={club?.avatar}
            alt={club?.name}
            className="rounded-full h-10 w-10 object-cover cursor-pointer"
              onClick={() => {
                navigate(paths.public.club.slug(slug));
              }}
          />
          <div className="flex flex-col">
            <p
              className="text-lg"
            >
              {club?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {club?.member_count} members
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={
              club?.is_member
                ? "ghost"
                : club?.application && club?.application?.status === "pending"
                  ? "secondary"
                  : "outline"
            }
            disabled={isJoinPending}
            onClick={() => handleJoin()}
          >
            {isJoinPending && (
              <Spinner className="mr-2" data-icon="inline-start" />
            )}

            {isJoinPending
              ? "Joining..."
              : club?.is_member
                ? "Joined"
                : club?.application?.status === "pending"
                  ? "Pending"
                  : "Join"}
          </Button>

          <Button variant={"ghost"} className={"rounded-full"} size="icon">
            <Search className="size-5" />
          </Button>
          <Button
            variant={"ghost"}
            className={"rounded-full group"}
            size="icon"
            onClick={() => {
              navigate(paths.private.club.config(slug));
            }}
          >
            <Cog className="size-5 transition-transform duration-200 group-hover:rotate-45" />
          </Button>

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
        </div>
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

  return (
    <section className="flex flex-col gap-8 max-w-3xl justify-around">
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
