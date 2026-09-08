import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/settings/routes";

import ClubDropdown from "../club/club-dropdown";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { Button } from "design/components/ui/button";
import { CircleEllipsis } from "lucide-react";
import { Spinner } from "design/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";
import { useUpdateClub } from "../../hooks/club.hooks";
import { toast } from "design/components/ui/toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import GokuImage from "@/assets/570b6554a692c0e846848347ac0c3db6.jpg";

const ClubLayoutHeader = ({
  club,
  slug,
  handleJoin,
  isJoinPending,
}: {
  club: any;
  slug: string;
  handleJoin: () => void;
  isJoinPending: boolean;
}) => {
  const { leave } = useUpdateClub(club?.slug, club?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLeave = () => {
    leave.mutate(undefined, {
      onSuccess: () => {
        toast.add({
          title: "Left",
          // description: "Club left successfully",
          type: "success",
        });
      },
      onError: (error) => {
        toast.add({
          title: "Error leaving club",
          // @ts-ignore
          description: error?.response?.data?.detail?.message,
          type: "error",
        });
      },
    });
  };

  return (
    <>
      {club && (
        <>
          <div className="flex gap-2 items-center">
            <div>
              {location.pathname !== paths.public.club.slug(slug) && (
                <>
                  <NavigateButtons hideForward />
                </>
              )}
            </div>

            <Avatar
              size="lg"
              className={"cursor-pointer"}
              onClick={(e) => {
                e.preventDefault();
                navigate(paths.public.club.slug(slug));
              }}
            >
              <AvatarImage src={club.avatar || GokuImage} alt={club.name} />
              <AvatarFallback>{club?.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-lg">{club?.name}</p>
              <span className="text-sm text-muted-foreground">
                {club?.member_count || (club?.total_members as string)} members
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {!club.is_member && (
              <Button
                variant={
                  club?.is_member
                    ? "ghost"
                    : club?.application &&
                      club?.application?.status === "pending"
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
            )}

            <Button variant={"ghost"} className={"rounded-full"} size="icon">
              <HugeiconsIcon icon={Search01Icon} className="size-5" />
            </Button>
            {club?.is_owner ? (
              <Button
                variant={"ghost"}
                className={"rounded-full group"}
                size="icon"
                onClick={() => {
                  navigate(paths.private.club.config(slug));
                }}
              >
                <HugeiconsIcon icon={Settings01Icon} className="size-5 transition-transform duration-200 group-hover:rotate-45" />
              </Button>
            ) : (
              <ClubDropdown
                club={club}
                trigger={
                  <Button
                    variant={"ghost"}
                    className={"rounded-full"}
                    size="icon"
                  >
                    <CircleEllipsis className="size-5 transition-transform duration-200" />
                  </Button>
                }
                onLeave={handleLeave}
                isMember={club?.is_member}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ClubLayoutHeader;
