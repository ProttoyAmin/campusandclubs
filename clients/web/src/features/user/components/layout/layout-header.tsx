import { paths } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import {
  CircleEllipsis
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavigateButtons from "@/shared/components/navigate-buttons";
import type { UserResponse } from "../../api/user.client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";
import { EditProfileDialog } from "../profile/edit-profile-dialog";
import type { UserProfile } from "@campus/api";
import type { AuthSession } from "@/features/auth/services/authentication";
import ProfileDropdown from "../profile/profile-dropdown";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Settings01Icon, SquareLockIcon } from "@hugeicons/core-free-icons";

const ProfileLayoutHeader = ({
  user,
  currentUser,
}: {
  user: UserResponse;
  currentUser: AuthSession;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {user && (
        <>
          <header className="flex items-center justify-between w-full md:p-2 p-1">
            <div className="flex gap-2 items-center">
              <div>
                {location.pathname !==
                  paths.private.user.profile(user.username) && (
                    <NavigateButtons hideForward />
                  )}
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  navigate(paths.private.user.profile(user.username));
                }}
                className="flex gap-2 items-center cursor-pointer">
                <Avatar
                  size="lg"
                >
                  <AvatarImage
                    src={user.avatar}
                    alt={user.username}
                  />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-lg">{user.username}</p>
                {user.is_private && (
                  <HugeiconsIcon icon={SquareLockIcon} className="size-5 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {user?.id === currentUser?.data.user.id ? (
                <>
                  <EditProfileDialog
                    trigger={<Button variant={"glass"}>Edit</Button>}
                    title="Edit Profile"
                    data={user as UserProfile}
                  />
                </>
              ) : (
                <>
                  {/* <Button variant={"outline"}>Follow</Button>
                  <Button variant={"outline"}>Message</Button> */}
                </>
              )}
              <Button variant={"ghost"} className={"rounded-full"} size="icon">
                {/* <Search className="size-5" /> */}
                <HugeiconsIcon icon={Search01Icon} className="size-5" />
              </Button>
              {user?.id === currentUser?.data.user.id ? (
                <Button
                  variant={"ghost"}
                  className={"rounded-full group"}
                  size="icon"
                  onClick={() => {
                    navigate(paths.private.settings.base);
                  }}
                >
                  <HugeiconsIcon icon={Settings01Icon} className="size-5 transition-transform duration-200 group-hover:rotate-45" />
                </Button>
              ) : (
                <ProfileDropdown
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
          </header>
        </>
      )}
    </>
  );
};

export default ProfileLayoutHeader;
