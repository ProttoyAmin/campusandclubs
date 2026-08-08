import type { UserProfileLayoutProps } from "@/layouts/user";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../hooks/user.hooks";
import {
  Card,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "design/components/ui/tabs";

import { Button } from "design/components/ui/button";
import { EditProfileDialog } from "../../components/profile/edit-profile-dialog";
import { useSession } from "@/features/auth/hooks";

import type { UserProfile } from "@campus/api";
import type { PrivateUserResponse } from "../../api/user.client";

function isPrivateUser(
  data: UserProfile | PrivateUserResponse,
): data is PrivateUserResponse {
  return data?.is_private;
}

const PrivateProfile: React.FC<{ data: PrivateUserResponse }> = ({ data }) => {
  return (
    <Card className="bg-background">
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
    </Card>
  );
};

const PublicProfile: React.FC<{
  data: UserProfile;
  currentUser: UserProfile;
}> = ({ data, currentUser }) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="flex justify-between ">
          <div>
            <div className="flex items-center gap-4">
              {data.first_name && data.last_name && (
                <h1 className="text-3xl">
                  {data.first_name} {data.last_name}
                </h1>
              )}

              {data.id === currentUser?.id ? (
                <EditProfileDialog
                  trigger={<Button variant={"outline"}>Edit</Button>}
                  title="Edit Profile"
                  data={data}
                />
              ) : (
                <Button variant={"outline"}>Follow</Button>
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
      </CardContent>
    </Card>
  );
};

const Profile: React.FC = () => {
  const username = useOutletContext<UserProfileLayoutProps>();
  const { data, error } = useUser(username as unknown as string);
  const { data: currentUser } = useSession();

  if (!data) return <div>Not found {error?.message}</div>;

  if (isPrivateUser(data)) {
    return <PrivateProfile data={data} />;
  }

  return <PublicProfile data={data} currentUser={currentUser} />;
};

export default Profile;
