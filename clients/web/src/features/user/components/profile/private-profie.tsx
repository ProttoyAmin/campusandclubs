
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
import { Button } from "design/components/ui/button";

export const PrivateProfileHeader: React.FC<{ data: PrivateUserResponse }> = ({ data }) => {
  return (
    <div className="bg-background overflow-y-auto max-h-[calc(100vh-64px)]">
      {/* <CardHeader>
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
      </CardHeader> */}
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
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">This Account is Private</h2>
          <p className="text-muted-foreground mt-2">
            Follow to see their content.
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant={"default"} className="w-1/2 rounded-full">Follow</Button>
          <Button variant={"outline"} className="w-1/2 rounded-full">Message</Button>
        </div>
      </CardContent>
    </div>
  );
};