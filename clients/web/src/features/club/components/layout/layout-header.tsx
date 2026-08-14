import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/settings/routes";

import ClubDropdown from "../club/club-dropdown";
import NavigateButtons from "@/shared/components/navigate-buttons";
import { Button } from "design/components/ui/button";
import { CircleEllipsis, Search, Settings } from "lucide-react";
import { Spinner } from "design/components/ui/spinner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";

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
  const navigate = useNavigate();
  const location = useLocation();

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
              <AvatarImage src={club.avatar || undefined} alt={club.name} />
              <AvatarFallback>{club?.name[0]}</AvatarFallback>
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
              <Search className="size-5" />
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
                <Settings className="size-5 transition-transform duration-200 group-hover:rotate-45" />
              </Button>
            ) : (
              <ClubDropdown
                trigger={
                  <Button
                    variant={"ghost"}
                    className={"rounded-full"}
                    size="icon"
                  >
                    <CircleEllipsis className="size-5 transition-transform duration-200" />
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ClubLayoutHeader;
