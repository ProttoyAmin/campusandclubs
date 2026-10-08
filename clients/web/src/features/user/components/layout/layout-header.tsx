import { paths } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import {
  CircleEllipsis
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavigateButtons from "@/shared/components/navigate-buttons";
import type { UserResponse } from "../../api/user.client";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";
import { EditProfileDialog } from "../profile/edit-profile-dialog";
import type { UserProfile } from "@campus/api";
import type { AuthSession } from "@/features/auth/services/authentication";
import ProfileDropdown from "../profile/profile-dropdown";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Settings01Icon, SquareLockIcon } from "@hugeicons/core-free-icons";
import { uploadProfilePicture } from "@/library/media";
import { Skeleton } from "design/components/ui/skeleton";

export const ProfileLayoutHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between w-full md:p-2 p-1">
      <div className="flex gap-2.5 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-25" />
          <Skeleton className="h-4 w-12.5" />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Skeleton className="h-8 w-18 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

const ProfileLayoutHeader = ({
  user,
  currentUser,
  isLoading
}: {
  user: UserResponse;
  currentUser: AuthSession;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();

  if (isLoading) return <ProfileLayoutHeaderSkeleton />

  const uploadAvatar = async (avatar: File) => {
    const payload = {
      media: avatar,
      file: avatar,
      role: "avatar",
      target_type: "user",
      object_id: user.id
    }
    const res = await uploadProfilePicture(payload);
    console.log(res);
  }

  const getNameLabel = () => {
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    return user.username
  }

  return (
    <>
      {user && (
        <>
          <header className="flex items-center justify-between w-full md:p-2 p-1">
            <div className="flex gap-2 items-center">
              <div>
                {currentUser?.data.user.id !== user.id && (
                  <NavigateButtons hideForward />
                )}
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  navigate(paths.private.user.profile(user.username));
                }}
                className="flex gap-2.5 items-center cursor-pointer">
                <Avatar
                  size="lg"
                >
                  <AvatarImage
                    src={user.avatar}
                    alt={user.username}
                  />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  {user.status === "online" && <AvatarBadge className="bg-green-600" />}
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-lg flex items-center gap-2">{`${getNameLabel()}`} <span className="">
                    {user.is_private && (
                      <HugeiconsIcon icon={SquareLockIcon} className="size-4 text-muted-foreground" />
                    )}</span></p>
                  <p className="text-xs text-muted-foreground">{`${user.user_post_count || 0} posts`}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {user?.id === currentUser?.data.user.id ? (
                <>
                  <EditProfileDialog
                    trigger={<Button variant={"glass"}>Edit</Button>}
                    title="Edit Profile"
                    data={user as UserProfile}
                    uploadAvatar={uploadAvatar}
                  />
                </>
              ) : (
                <>
                  {/* <Button variant={"outline"}>Follow</Button>
                  <Button variant={"outline"}>Message</Button> */}
                </>
              )}
              <Button variant={"ghost"} className={"rounded-full"} size="icon">
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
                  user={user as UserProfile}
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
