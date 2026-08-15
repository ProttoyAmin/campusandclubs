import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from "design/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "design/components/ui/avatar";
import type { Member } from "../../http/membership.http";
import { Link } from "react-router-dom";
import { paths } from "@/settings/routes";
import { Button } from "design/components/ui/button";
import { TrashIcon } from "lucide-react";

interface MemberCardProps {
  member: Member;
  showActions: boolean;
  variant?: "list" | "card";
}

const MemberCard = ({
  member,
  showActions,
  variant = "card",
}: MemberCardProps) => {
  if (variant === "list") {
    return (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={member?.profile_picture_url} />
          <AvatarFallback>{member?.username[0]}</AvatarFallback>
        </Avatar>
        <Link to={paths.private.user.profile(member.username)}>
          {member?.username}
        </Link>
        <span className="text-xs text-muted-foreground">
          Since {new Date(member?.joined_at).getFullYear()}
        </span>
        {showActions && (
          <Button size="xs" variant="destructive" className="ml-auto">
            <TrashIcon />
          </Button>
        )}
      </div>
    );
  }
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Avatar size="sm">
            <AvatarImage src={member?.profile_picture_url} />
            <AvatarFallback>{member?.username[0]}</AvatarFallback>
          </Avatar>
          <Link to={paths.private.user.profile(member.username)}>
            {member?.username}
          </Link>
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Since {new Date(member?.joined_at).getFullYear()}
        </span>
        {showActions && (
          <CardAction>
            <Button size="xs" variant="destructive">
              <TrashIcon />
            </Button>
          </CardAction>
        )}
      </CardFooter>
    </Card>
  );
};

export default MemberCard;
