import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";
import type { UserProfile } from "@campus/api";
import { Button } from "design/components/ui/button";
import type { AuthSession } from "@/features/auth/services/authentication";
import ToggleFollowButton from "@/features/user/components/actions/follow-button";

export const PublicProfileHeader: React.FC<{
  data: UserProfile;
  currentUser: AuthSession;
}> = ({ data, currentUser }) => {
  return (
    <>
      <CardHeader className="block md:flex md:flex-row-reverse justify-between">
        <CardTitle className="place-items-center">
          <Avatar size="3xl">
            <AvatarImage src={data?.avatar} alt={data?.username} />
            <AvatarFallback>{data.username[0]}</AvatarFallback>
          </Avatar>
        </CardTitle>
        <CardDescription className="space-y-4">
          <div className="flex flex-col gap-2 text-center md:text-start mt-2">
            {data.first_name && data.last_name && (
              <h1 className="text-xl font-bold text-foreground">
                {data.first_name} {data.last_name}
              </h1>
            )}
            <p className="text-muted-foreground">@{data.username}</p>
          </div>
          <div className="flex gap-2 items-center mt-2 justify-center">
            <span className="text-sm">
              {data.follower_count}{" "}
              {data.follower_count === 1 ? "follower" : "followers"}
            </span>
            <span className="text-sm">
              {data.following_count} following
            </span>
            {data.club_count > 0 && (
              <span className="text-sm">
                {data.club_count} {data.club_count === 1 ? "club" : "clubs"}
              </span>
            )}
          </div>
          {data.bio && (
            <p className="whitespace-pre-wrap mt-2 text-center md:text-start">
              {data.bio}
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        {data?.id !== currentUser?.data?.user?.id && <div className="p-2">
          <div className="flex gap-2 mt-2">
            <ToggleFollowButton userId={data.id} username={data.username} followStatus={data.follow_status as string} />
            <Button variant={"outline"} className="w-1/2 rounded-full">Message</Button>
          </div>
        </div>}
        {/* <pre>
          {JSON.stringify(data, null, 2)}
        </pre> */}
      </CardContent>
    </>
  );
};
