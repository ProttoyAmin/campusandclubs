
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "design/components/ui/card";
import type { PrivateUserResponse } from "../../api/user.client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "design/components/ui/avatar";

export const PrivateProfile: React.FC<{ data: PrivateUserResponse }> = ({ data }) => {
  return (
    <div className="bg-background overflow-y-auto max-h-[calc(100vh-64px)]">
      <CardHeader>
        <CardTitle className="flex justify-between ">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl">
                {data.first_name} {data.last_name}
              </h1>
            </div>
            <CardDescription>{data.username}</CardDescription>
            <CardDescription>{data.detail}</CardDescription>
          </div>
          <Avatar size="3xl">
            <AvatarImage src={data.avatar || undefined} alt={data.username} />
            <AvatarFallback>{data.username[0]}</AvatarFallback>
          </Avatar>
        </CardTitle>
        <div className="flex gap-2 items-center">
          <CardDescription className="text-sm">
            {data.follower_count}{" "}
            {data.follower_count === 1 ? "follower" : "followers"}
          </CardDescription>
          <CardDescription className="text-sm">
            {data.following_count} following
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">This Account is Private</h2>
          <p className="text-muted-foreground mt-2">
            Follow to see their posts and clubs.
          </p>
        </div>
      </CardContent>
    </div>
  );
};