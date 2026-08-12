import { paths } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import { Search, CircleEllipsis, LockIcon, SettingsIcon } from "lucide-react";
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
          <div className="flex gap-2 items-center">
            <div>
              {location.pathname !==
                paths.private.user.profile(user.username) && (
                <NavigateButtons />
              )}
            </div>
            <Avatar
              size="lg"
              className={"cursor-pointer"}
              onClick={(e) => {
                e.preventDefault();
                navigate(paths.private.user.profile(user.username));
              }}
            >
              <AvatarImage src={user.avatar || undefined} alt={user.username} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex gap-2 items-center">
              <p className="text-lg">{user.username}</p>
              {user.is_private && (
                <LockIcon className="size-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {user?.id === currentUser?.data.user.id ? (
              <EditProfileDialog
                trigger={<Button variant={"outline"}>Edit</Button>}
                title="Edit Profile"
                data={user as UserProfile}
              />
            ) : (
              <>
                <Button variant={"outline"}>Follow</Button>
                <Button variant={"outline"}>Message</Button>
              </>
            )}
            <Button variant={"ghost"} className={"rounded-full"} size="icon">
              <Search className="size-5" />
            </Button>
            {user?.id === currentUser?.data.user.id ? (
              <Button
                variant={"ghost"}
                className={"rounded-full group"}
                size="icon"
                onClick={() => {
                  navigate(paths.private.settings.account);
                }}
              >
                <SettingsIcon className="size-5 transition-transform duration-200 group-hover:rotate-45" />
              </Button>
            ) : (
              <Button variant={"ghost"} className={"rounded-full"} size="icon">
                <CircleEllipsis className="size-5 transition-transform duration-200" />
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ProfileLayoutHeader;
