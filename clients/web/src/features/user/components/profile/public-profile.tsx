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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "design/components/ui/tabs";

export const PublicProfile: React.FC<{
  data: UserProfile;
  currentUser: UserProfile;
}> = ({ data }) => {
  return (
    <div className="">
      <CardHeader>
        <CardTitle className="flex justify-between ">
          <div>
            <div className="flex items-center gap-4">
              {data.first_name && data.last_name && (
                <h1 className="text-3xl">
                  {data.first_name} {data.last_name}
                </h1>
              )}
            </div>
            <CardDescription>{data.username}</CardDescription>
            {data.bio && (
              <CardDescription className="whitespace-pre-wrap mt-2">
                {data.bio}
              </CardDescription>
            )}
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
          {data.club_count > 0 && (
            <CardDescription className="text-sm">
              {data.club_count} {data.club_count === 1 ? "club" : "clubs"}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts">
          <TabsList variant="line" className={"w-full"}>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="reels">Reels</TabsTrigger>
            <TabsTrigger value="reposts">Reposts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">Posts</TabsContent>
          <TabsContent value="reels">Reels</TabsContent>
          <TabsContent value="reposts">Reposts</TabsContent>
        </Tabs>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </CardContent>
    </div>
  );
};
