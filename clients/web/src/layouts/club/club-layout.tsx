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
import defaultBanner from "@/assets/4578-dragon-ball-z.png";
import GokuImage from "@/assets/570b6554a692c0e846848347ac0c3db6.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "design/components/ui/avatar";
import BottomBar from "@/components/bottom-bar";

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
      className="md:ms-33 flex flex-col gap-4 max-w-full"
    >
      <div className="max-w-3xl w-full">
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
      <div className="">
        <Card ref={scrollRef} className="max-w-fit border-none rounded-none md:border md:rounded-xl bg-background overflow-x-hidden gap-0 overflow-y-auto min-h-[calc(100vh-7rem)] max-h-[calc(100vh-7rem)] scrollbar-none p-0">
          <Outlet context={{ club }} />
        </Card>
        <div className="md:hidden fixed bottom-0 w-full z-50 h-12 w-full bg-background">
          <BottomBar />
        </div>
        {/* <Card className="w-md max-h-fit bg-background p-0 hidden xl:block">
          <div className="relative">
            <img src={defaultBanner} alt={`${club?.name} banner`} className="object-cover" />
            <Avatar
              size="2xl"
              className={"absolute -bottom-8 right-8"}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <AvatarImage src={GokuImage} alt={club?.name} />
              <AvatarFallback>{club?.name?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <p className="text-muted-foreground"> • {club?.total_members} members</p>
              <p className="text-green-500">• {club?.total_members} online</p>
            </div>
            <p className="text-muted-foreground">{club?.about}</p>
          </div>
        </Card> */}
      </div>
    </section>
  );
};

export default ClubMainLayout;
